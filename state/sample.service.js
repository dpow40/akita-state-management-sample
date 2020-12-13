import { store } from './sample.store';
import { getJoke } from "../ajax.service";
import { Joke } from '../models/joke.model';

export async function update() {
  await Promise.resolve();
  const result = await getJoke();
  store.update( state => {
    console.log(state)
    const newJoke = new Joke(result.data);
    console.log('creating joke')
    console.log(newJoke);
    return {
      category: newJoke.category,
      delivery: newJoke.delivery
    }
  });
}

