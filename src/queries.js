const fetch_handled = (url) => {
  return fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          console.log("Fetching ", url, 
          // "Data:", data
          );
          return data;
      })
      .catch(error => {
          // console.error('There was a problem with the fetch operation for ' + url + ':', error);
          // throw error; // Rethrow the error to maintain error propagation
      });
}


export default fetch_handled;
