import { pageStore } from './page.store';

export async function update(id, data) {
  await Promise.resolve();
  pageStore.update(id, data);
}

export async function remove(id) {
  await Promise.resolve();
  pageStore.remove(id);
}
