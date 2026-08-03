# Hosting & object storage: options and tradeoffs

Not a decision yet - notes to revisit when there's budget/time to act. Current
state: everything (the old Node app, and presumably Postgres) runs self-managed
on a single EC2 instance. This app serves Colombia only; no need for
multi-region.

## Compute + DB options at a glance

| Path | ~Monthly cost | Real multi-instance failover? | Effort to get there |
|---|---|---|---|
| D: keep EC2, add managed Postgres only (Supabase/Neon) | $15-25 on top of current EC2 | No | Lowest - repoint `DATABASE_URL`, nothing else changes |
| A: EC2 + RDS + auto-recovery + restart policy | ~$25-30 | No (fast auto-restart, not zero-downtime) | Low - all AWS-native, no new platform |
| C: DigitalOcean Droplet + Managed DB | ~$21-27 | No (add 2nd DB node for failover, +~$15) | Low - simpler dashboard than AWS |
| C: DigitalOcean App Platform + Managed DB (HA) | ~$54 | Yes | Medium - new deploy model, still DO-only |
| B: Fly.io (2 instances + Postgres replica) | ~$20-35 | Yes | Medium-high - new platform, new deploy model, has a literal Bogota region |
| AWS full HA (2x EC2 + ALB + Multi-AZ RDS) | ~$70-100+ | Yes | High - most manual wiring, most AWS expertise needed |

Details and reasoning for each below.

## Object storage (uploaded vehicle/offer photos)

Current: local disk (`data/images/`), fine for a single persistent server, but
won't survive redeploys/scaling on most other hosting models, and isn't
backed up independently of the server itself.

Estimated real volume: a few hundred listings x up to 6 WEBP photos each,
~100-200KB apiece after the frontend's client-side resize -> low single-digit
GB total, growing slowly. At this scale, storage cost itself is a rounding
error everywhere; **egress (data transfer out) is the line item that
actually differs between providers**, since these images are served directly
to the public and requested repeatedly.

| Provider | Storage | Egress | Notes |
|---|---|---|---|
| **Cloudflare R2** | $0.015/GB-mo | **$0** | S3-API-compatible (existing S3 SDK code works, just change the endpoint). Free tier (10GB storage, 10M reads/mo) likely covers this project entirely. |
| **Backblaze B2** | $0.006/GB-mo | Free via Cloudflare Bandwidth Alliance pairing | Cheapest raw storage; needs the Cloudflare pairing to get free egress. |
| **DigitalOcean Spaces** | Flat $5/mo (250GB + 1TB transfer incl.) | Included up to 1TB | Simplest flat pricing, no per-request math. |
| **AWS S3** | $0.023/GB-mo | ~$0.09/GB to internet | Egress is the real cost here for a public-image workload. Mitigated (not eliminated) by CloudFront caching - see below. |

**Recommendation: Cloudflare R2.** Realistically $0/month at this project's
volume, S3-compatible so migration is a config change not a rewrite, and the
egress-free model is exactly suited to "serve the same handful of images to
the public repeatedly."

### If staying on S3: does CloudFront help?

Yes, but it moves the cost, it doesn't remove it. S3->CloudFront transfer is
free, but CloudFront's own egress to the internet is still billed (~$0.085/GB
for the first 10TB, slightly under S3's direct rate). The actual saving comes
from **caching**: repeat requests for the same image get served from
CloudFront's edge cache instead of re-hitting S3, so *effective* egress volume
drops with any request locality/repetition - which car listing photos have
(the same handful of images viewed repeatedly). You're trading a CDN's worth
of setup complexity for that reduction. R2 sidesteps the whole calculation:
egress is free regardless of caching.

### Is R2 a "real" competitor to S3?

Yes - S3-API-compatible, backed by Cloudflare's actual production network, used
by real companies for this exact "serve a lot of static files cheaply"
workload. Where it's genuinely behind S3: no deep-archive/Glacier-equivalent
tier, fewer regions/consistency guarantees for heavy transactional workloads,
smaller third-party tooling ecosystem, younger product overall (2022 GA vs
S3's 2006). None of those gaps matter for a car dealership's image bucket.

## Compute + database hosting

### Why this doc initially suggested Fly/Railway/Render

Not because AWS is inherently more expensive at the compute level - a raw EC2
instance is often cheaper per vCPU than these platforms. The expense is in
*assembling real HA yourself* on AWS: an Application Load Balancer (~$16-20/mo
plus per-request charges), a second EC2 instance (doubles compute cost), and
RDS Multi-AZ for automatic DB failover (~2x a single-AZ RDS instance). All in,
genuine multi-instance AWS HA lands around **$60-100+/month**, and you
personally configure and maintain the auto-scaling group, target groups, and
health checks - not just a dollar cost, a time-and-risk cost (a misconfigured
health check means a crashed instance never gets replaced).

Fly/Railway/Render bundle equivalent HA (multi-instance, health-checked,
auto-restarting app + managed Postgres with a standby replica) as one product,
mostly by convention rather than manual wiring.

Given the pushback on Fly specifically (fair - it's a smaller, less familiar
platform), **the AWS-native path below is a legitimate alternative** if
staying in a familiar ecosystem matters more than minimizing setup effort.

### Path A: cheap, incremental HA improvements on AWS (stay on EC2)

Biggest wins for the least cost/effort, roughly in order:

1. **Move Postgres off the EC2 box onto RDS** (single-AZ `db.t4g.micro`,
   ~$13-15/mo). Gets you automated daily backups, point-in-time recovery, and
   automated minor-version patching for free, and decouples the database's
   lifecycle from the app instance's - redeploying or rebooting the app can no
   longer risk the database. This is the single highest-value change here.
2. **EC2 Auto Recovery** (built-in, no extra charge): automatically reboots/
   migrates the instance on a hardware-level failure (status check failure).
   Doesn't help with application-level crashes.
3. **Run the app via the Docker image with `restart: unless-stopped`** (or a
   systemd unit with `Restart=always` if not using Docker) - an app-level
   crash restarts within seconds, near-zero cost.
4. **Keep the Dockerfile as the source of truth for "how to rebuild this
   server"** (already true as of this repo) - if the whole instance dies, you
   can relaunch onto a fresh EC2 instance in minutes by pulling the image,
   rather than hours of manual reconstruction.

Rough total: current EC2 cost + ~$13-15/mo RDS = call it **$25-30/month all
in**. This is *not* zero-downtime multi-instance HA - a crashed/rebooted app
instance still means a brief outage - but it closes the two biggest actual
risks (losing the database, and a crash requiring manual intervention) for
comparatively little money.

The next tier up - true zero-downtime (2 app instances + ALB + Multi-AZ RDS)
- is the ~$70-100+/month bracket mentioned above.

### Path B: Fly.io

2x shared-cpu-1x app instances in `bog` (Bogota - Fly has an actual Bogota
region, which is the concrete reason it came up: AWS has no Colombia region,
nearest options are us-east-1/Virginia or sa-east-1/Sao Paulo, see below) +
Fly Postgres with a standby replica: roughly **$20-35/month total**, HA and
health-checked failover built in with minimal config. Tradeoff: migrating off
EC2 and learning Fly's deploy model (a `fly.toml`, not far off conceptually
from the Dockerfile already in this repo) - real switching cost if AWS
familiarity is valuable on its own.

### Path C: DigitalOcean

Two ways to use it, both cheaper and simpler to configure than the AWS
equivalents (DO's networking/dashboard is far less to learn than VPCs,
security groups, and IAM):

- **Droplet + Managed Database** (closest to what's running today - just
  swap self-hosted Postgres for a managed one). A basic Droplet ($6-12/mo)
  running the Docker image, plus DigitalOcean Managed PostgreSQL starting
  at ~$15/mo for a single node (1 vCPU/1GB/10GB, automated daily backups and
  point-in-time recovery included even on the single-node plan). Total:
  **~$21-27/month**, no self-hosted DB, no ALB/RDS complexity to configure.
  Add a second node for automatic failover (~$30/mo for the DB alone) when
  budget allows.
- **App Platform + Managed Database**: DO's PaaS offering (deploys directly
  from a Dockerfile/GitHub repo, similar bundling to Fly/Railway/Render but
  from a more established, mainstream provider). Professional tier supports
  2+ instances behind a load balancer out of the box. Roughly
  **~$54/month** for genuine 2-instance HA + DB standby (2x app instance +
  load balancer + HA-tier managed DB) - notably cheaper than the AWS
  ALB+Multi-AZ-RDS+2xEC2 equivalent (~$70-100+) for a comparable HA level.

Region caveat: DigitalOcean has **no South America region either** (nearest
is NYC) - same latency story as AWS us-east-1, so this doesn't change the
Colombia-latency question one way or the other. Worth the same "actually
measure it" caveat as below.

### Path D: cheapest possible fix - keep EC2 exactly as-is, just add a managed Postgres

If the goal is specifically "stop self-hosting Postgres" without touching
anything else yet, the smallest possible change is repointing `DATABASE_URL`
at a third-party managed Postgres and leaving the EC2 app instance untouched:

- **Supabase**: Pro tier ~$25/month (8GB storage, no pausing, daily backups,
  choose an AWS region under the hood). Free tier exists but pauses the
  database after a period of inactivity - not viable for production.
- **Neon**: serverless/autoscaling Postgres, ~$19/month (Launch tier) to
  avoid the free tier's scale-to-zero behavior (which otherwise adds a
  cold-start delay - a second or more - to the first request after idle).
  Branching is a nice bonus for spinning up throwaway copies for testing.
- **Aiven for PostgreSQL**: multi-cloud, generally the priciest of these
  (tends to start north of $50/month even at small sizes) - mentioned for
  completeness, not really a "broke" option.

This is the lowest-effort, lowest-risk change available: no app migration,
no new deploy model to learn, closes the single biggest reliability gap
(losing the database with no backups) for **~$15-25/month** on top of
whatever EC2 already costs.

## Open questions to resolve before deciding

- **Actually measure latency** from a real Colombian connection (residential
  and mobile) to us-east-1 vs sa-east-1 - don't assume either based on map
  distance. A simple `curl -w "%{time_connect}"` against an endpoint in each
  region is enough for a first pass.
- Decide how much manual ops work (health checks, restart policies, backup
  verification) is realistically going to get done and kept up to date on
  Path A - a cheap HA design that nobody maintains isn't actually HA.
