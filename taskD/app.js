import {debounce, throttle} from './utility.js';
import {fetchData} from './api.js';
async function dashboard(){
    console.log('Dashboard loaded');
    const handleSearch = debounce(() =>console.log('Search input changed'), 500);
    console.log("user typing 'A'....");
    handleSearch();
    console.log("user typing 'Al'....");
    handleSearch();
    console.log("user typing 'Ali'....");
    handleSearch();

const handleScroll = throttle(() => console.log('User scrolled'), 1000);
const scrollEvent = setInterval(() => {
    console.log('User is scrolling...');
    handleScroll();
}, 300);
setTimeout(() => {
    clearInterval(scrollEvent);
    console.log('Stopped scroll event simulation');
}, 5000);
const currentSessionKey = { id: 'user1' };
console.log ('Fetching data for userId 1');
await fetchData(currentSessionKey, 1);
console.log('Fetching data for userId 1 again');
await fetchData(currentSessionKey, 1);
}

dashboard().catch(console.error);
