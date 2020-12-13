import * as axios from "axios";


export async function getJoke() {
    return axios.get('https://sv443.net/jokeapi/v2/joke/Any')
}