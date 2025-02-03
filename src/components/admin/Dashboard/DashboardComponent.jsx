import { useState, useEffect } from 'react';
import axios from 'axios';

import VehicleSearchChart from './VehicleSearchChart';

const DashboardComponent = () => {
    const [searchData, setSearchData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchData = async () => {
            try {
                const response = await axios.get('/api/search/stats');
                setSearchData(response.data);
            } catch (error) {
                console.error('Error fetching search data:', error);
            }
            setLoading(false);
        };
        fetchSearchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <h3>Dashboard</h3>
                    <div className="card mt-4">
                        <div className="card-body">
                            <VehicleSearchChart searchData={searchData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent; 