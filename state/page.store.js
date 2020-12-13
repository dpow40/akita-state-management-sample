import { createEntityStore } from '@datorama/akita';

const initialState = {
  pages: [1,2,3]
};
/*
* Entity store is used to manage a specific type of entities
* like rooms for example.
*/
export const pageStore = createEntityStore(initialState, {
  name: 'page'
});
