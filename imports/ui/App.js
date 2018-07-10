import React, {Component} from 'react'
import './App.css'

import axios from 'axios'

class App extends Component {
    constructor() {
        super();
        this.state = {
            inputValue: '',
        };
        this.response = {
            tweets: [],
            userSummary: {},
            profileData: {}
        };
        this.handleClick = this.handleClick.bind(this)
    }

    setResponse(newResponse) {
        console.log('newResponse',newResponse);
        this.response = newResponse;

    }

    handleClick() {
        axios.get('http://localhost:3000/getSummary?username=' + this.state.inputValue.toString())
            .then((response) => {
                if (response.data.obj.error) {
                    axios.get('http://localhost:3000/getTweets?twiterUser=' + this.state.inputValue.toString())
                        .then((responseGetTwets) => {
                            console.log('getTweets',responseGetTwets.data.obj);
                            this.setResponse(responseGetTwets.data.obj);
                            this.setState({inputValue:this.state.inputValue.toString()})
                        })
                }
                else {
                    console.log('getSummary');
                    this.setResponse(response.data.obj[0]);
                    this.setState({inputValue:this.state.inputValue.toString()})
                }

            })
    }

    updateInputValue(evt) {
        this.setState({
            inputValue: evt.target.value
        });
    }

    render() {
        return (
            <div className='button__container'>
                <input type="text" value={this.state.inputValue} onChange={evt => this.updateInputValue(evt)}/>
                <button className='button' onClick={this.handleClick}>Click Me</button>

                {
                    this.response &&
                    <h2>
                        {this.response.profileData.name}
                    </h2>
                }
                <ul>
                    {
                        console.log(this.response)
                    }
                    {
                        this.response.tweets.map(function (tweet, index) {
                            return <li key={index}>{tweet.tweet_text}</li>;
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default App