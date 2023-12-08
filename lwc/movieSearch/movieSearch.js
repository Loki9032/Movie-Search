import { LightningElement, track, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import movie_channel from '@salesforce/messageChannel/movieChannel__c';
const DELAY = 300;
export default class MovieSearch extends LightningElement {

    selectedPageNo = "1";
    selectedSearch = "";
    selectedType = "";
    loading = false;
    delayTimeout;
    selectedmovie = "";
    @wire(MessageContext)
    messageContext;

    @track searchResult = [];

    get typeoptions() {
        return [
            { label: 'None', value: '' },
            { label: 'Movie', value: 'movie' },
            { label: 'Series', value: 'series' },
            { label: 'Episode', value: 'episode' }
        ];
    }

    handleChange(event) {
        let { name, value } = event.target;
        this.loading = true;
        if (name == 'type') {
            this.selectedType = value;
        } else if (name == "search") {
            this.selectedSearch = value;
        } else if (name == "pageNumber") {
            this.selectedPageNo = value;
        }
        clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            this.searchMovie();
        }, DELAY);

    }
    async searchMovie() {
        const url = `https://www.omdbapi.com/?s=${this.selectedSearch}&type=${this.selectedType}&page=${this.selectedPageNo}&apikey=8c503752`;
        try {
            const res = await fetch(url, { method: 'GET' })
                .then((res) => res.json())
                .then((data) => {
                    console.log("The movie Search is: ", data);
                    this.loading = false;
                    if (data.Response === "True") {
                        this.searchResult = data.Search;
                        console.log("render movie list", this.searchResult);
                    }

                })


        } catch (error) {
            console.log("Error fetching data:", error);
            // Handle the error, e.g., display an error message to the user
        }

    }
    movieSelectedHandeler(event) {
        this.selectedmovie = event.detail;
        const payload = { movieId: this.selectedmovie };

        publish(this.messageContext, movie_channel, payload);
    }


    get displaySearchResult() {
        return this.searchResult.length > 0 ? true : false;
    }
}