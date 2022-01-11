import React, {Component} from 'react';
import axios from 'axios';
import Joke from "./Joke";
import {v4 as uuid} from 'uuid';
import './JokeList.css';
import { CSSTransition, TransitionGroup } from "react-transition-group";
export default class JokeList extends Component{
    static defaultProps = {
        numJokesToGet: 10
    }
    constructor(props){
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        }
        this.setJokes = new Set(this.state.jokes.map(j => j.joke));
    }
    componentDidMount(){
        if(this.state.jokes.length === 0)
            this.getJokes();
    }
    async getJokes(){
        try{
            const headers = {Accept: 'application/json'};
            let tmp_joke = []
            while(tmp_joke.length < this.props.numJokesToGet){
                let response = await axios.get("https://icanhazdadjoke.coms/", {headers: headers});
                let newJoke = {joke: response.data.joke, vote: 0, id: uuid()}
                if(!this.setJokes.has(newJoke.joke)){
                    tmp_joke.push(newJoke);
                }else{
                    console.log("duplicated");
                }
            }
            this.setState(st =>({
                loading: false,
                jokes: [...st.jokes, ...tmp_joke]
            }),
            (window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)))
            );
        }catch(err){
            alert(err);
            this.setState({loading: false});
        }
    }
    handleVote = (id, delta)=>{
        this.setState(st=>({
            jokes: st.jokes.map(j =>
                (j.id === id) ? {...j, vote: j.vote + delta} : j
            )
        }),
            window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    };
    handlClick = ()=>{
        this.setState({loading: true}, this.getJokes)
    };
    render(){
        let jokes = this.state.jokes.sort((a,b)=> b.vote - a.vote).map(joke =>(
            <CSSTransition
            key={joke.id}
            timeout={1000}
            >
            <div>
                <Joke key={joke.id}
                  vote={joke.vote}
                  joke={joke.joke}
                  upVote = {()=>{this.handleVote(joke.id, 1)}}
                  downVote = {()=>{this.handleVote(joke.id, -1)}}
                  />
            </div>
            </CSSTransition>
        ));
        if(this.state.loading){
            return (<div className="JokeList-spinner">
                <i className="far fa-8x fa-laugh fa-spin"></i>
                <h1 className='JokeList-title'>Loading....</h1>
            </div>);
        }else{
            return (<div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"><span>Dad</span> Jokes</h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"/>
                    <button className="JokeList-getmore" onClick={this.handlClick}>New Jokes</button>
                </div>
                <div className='JokeList-jokes'>
                    <TransitionGroup>
                        {jokes}
                    </TransitionGroup>
                </div>
        </div>);
        }
    }
} 