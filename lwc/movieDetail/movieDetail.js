import { LightningElement,wire } from 'lwc';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from 'lightning/messageService';
import movie_channel from '@salesforce/messageChannel/movieChannel__c';

export default class MovieDetail extends LightningElement {
    loadComponent =false;
    subscription = null;
    movieDetail ={};
    @wire(MessageContext)
    messageContext;
    

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                movie_channel,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    handleMessage(message) {
        this.movieId = message.movieId;
        console.log("selected movie", this.movieId);
        this.fetchMovieDetail(this.movieId);
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    async fetchMovieDetail(movieId) {
        let url = `https://www.omdbapi.com/?i=${movieId}&plot=full&apikey=8c503752`;
       try {
            const res = await fetch(url, { method: 'GET' })
                .then((res) => res.json())
                .then((data) => {
                    console.log("The Selected Movie is: ", data);
                    this.loadComponent =true;
                    this.movieDetail = data;
                });
        }catch (error) {
            console.log("Error fetching data:", error);
            // Handle the error, e.g., display an error message to the user
        }
    }
    
}