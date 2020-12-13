import {  createStore } from '@datorama/akita';
/*
* A store is used more high level management of data. Data
* that we might want to keep for the whole user session or
* that we want persisted as he revisits 
*/
export const store = createStore({
  joke: {
    category: '',
    delivery: ''
  }
   }, { name: 'sampleStore' });

