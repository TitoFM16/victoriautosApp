export async function checkIfAuthenticated() {
  try {
    const response = await fetch('/api/users/check-auth-cookie', {
      method: 'GET',
      credentials: 'include'
    });
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Expected JSON but got:', contentType);
      return false;
    }
    
    const data = await response.json();
    return data.authenticated || false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}