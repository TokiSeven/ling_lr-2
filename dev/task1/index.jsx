import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import Atomate from './atomate.js';

export default class Task1 extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data: ""
        };
        this.Atomate = new Atomate("");
        this.handlerChangedInput = this.handlerChangedInput.bind(this);
    }

    handlerChangedInput(e){
        this.setState({
            data: e.target.value
        });
    }

    render(){
        this.Atomate.setData(this.state.data);
        let result = this.Atomate.Do();
        let style = result === 'Все хорошо' ? "success" : "danger";
        return(
            <Row>
                <Col xs = {12} sm = {6} smOffset = {3}>
                    <input type = "text" onChange = {this.handlerChangedInput} className = "form-control" />
                    <br />
                    <ul className = "list-group">
                        <li className = {"list-group-item list-group-item-" + style}>
                            {result}
                        </li>
                    </ul>
                </Col>
            </Row>
        );
    }
}