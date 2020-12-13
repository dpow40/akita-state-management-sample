import { createEntityQuery } from '@datorama/akita';
import { pageStore } from './page.store';

export const pageQuery = createEntityQuery(pageStore);
