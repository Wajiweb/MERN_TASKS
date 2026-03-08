import { ApiError,cache } from "./errorCache.js";      
export async function fetchData(requestKey,userId) {
    if (cache.has(requestKey)) {
        console.log('Returning cached data');
        return cache.get(requestKey);
    
}
try {
    console.log(`Fetching data from API ${userId}...`);
    const userRes = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!userRes.ok) {throw new ApiError(`HTTP error! status: ${userRes.status}`, userRes.status);
    }       
    const user = await userRes.json();
    console.log(`Fetching data from API ${user.name}`);
    const postRes = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    if (!postRes.ok) {throw new ApiError(`HTTP error! status: ${postRes.status}`, postRes.status);
    }       
    const posts= await postRes.json();
    const commentsPromises = posts.map (post => {

        return fetch(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`)
        .then(res=> res.json())
     

        });    
    const commentsData = await Promise.allSettled(commentsPromises);
const sucessfulComments = commentsData
.filter(result => result.status === 'fulfilled')
.map(result => result.value);
const result = { user,posts,comments: sucessfulComments
};
cache.set(requestKey, result);
} catch (error) {       
    if (error instanceof ApiError) {

        console.error(`API Error: ${error.message} (Status Code: ${error.statusCode})`);
    } else {
        console.error(`Unexpected Error: ${error.message}`);
}};
return cache.get(requestKey);
}
