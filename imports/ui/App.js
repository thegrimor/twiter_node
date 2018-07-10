import React, {Component} from 'react'
import './App.css'

import axios from 'axios'

class App extends Component {
    constructor() {
        super();
        this.state = {
            inputValue: ''
        };
        this.response = {
            obj: [],
            message: '',
        };
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        console.log(this.state.inputValue.toString())
        axios.get('http://localhost:3000/getSummary?username=' + this.state.inputValue.toString())
            .then((response) => {
                let responseState={obj: response.data.obj, message: response.data.message}
                if (response.data.obj.error) {
                    console.log('get tweets');
                    axios.get('http://localhost:3000/getTweets?twiterUser='+this.state)
                        .then((responseGetTwets) => {
                                this.setState({obj: responseGetTwets.data.obj, message: responseGetTwets.data.message});
                        })
                }
                this.setState(responseState);

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
                {this.response.obj[0] &&
                <h2>
                    {this.response.obj[0].profileData.name}
                </h2>
                }
                <ul>
                    {this.response.obj.map(function (obj) {
                        return obj.tweets.map(function (tweet, index) {
                            return <li key={index}>{tweet.tweet_text}</li>;
                        })
                    })}
                </ul>
            </div>
        )
    }
}

export default App