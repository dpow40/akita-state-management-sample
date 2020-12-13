import { query } from "./sample.query";
import { update } from "./sample.service";
import { getJoke } from "../ajax.service";
import { pageQuery } from "./page.query";

export const sampleStore = query.select();
sampleStore.subscribe(x => {
    console.log(`Subscription fired ${x}`)
    console.log(x)
})
console.log('starting update 1')
update()
console.log('finished update 1')
update()

export const pageStore = pageQuery.select('pages')

pageStore.subscribe(x => console.log(x))