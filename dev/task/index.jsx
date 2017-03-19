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
        this.convertResult = this.convertResult.bind(this);
    }

    handlerChangedInput(e){
        this.setState({
            data: e.target.value
        });
    }

    isStateWithTerminal(name, terminal, data){
        let r = false;
        data.forEach(v => {
            if (v.name == name && v.terminal == terminal){
                r = true;
                return false;
            }
        });
        return r;
    }

    convertResult(data){
        let converted = [];
        data.forEach(v => {
            let _d = {
                'name': v.name,
                '0': [],
                '1': [],
                'e': []
            };
            v.nexts.forEach(next => {
                if (this.isStateWithTerminal(next, '0', data)) _d['0'].push(next);
                if (this.isStateWithTerminal(next, '1', data)) _d['1'].push(next);
                if (this.isStateWithTerminal(next, 'e', data)) _d['e'].push(next);
            });
            converted.push(_d);
        });
        return converted;
    }

    render(){
        this.Atomate.setData(this.state.data);
        let result = this.Atomate.Do();
        let style = Array.isArray(result) ? "success" : "danger";
        if (Array.isArray(result)){
            // result = this.convertResult(result).map(v => {
            result = result.map(v => {
                return (
                    <tr className = 'text-left'>
                        <td>{v.name}</td>
                        <td>{v['0'].join(", ")}</td>
                        <td>{v['1'].join(", ")}</td>
                        <td>{v['e'].join(", ")}</td>
                    </tr>
                );
            });
            result = (
                <table className = 'table table-hover table-condensed'>
                    <thead>
                        <th>Состояния</th>
                        <th>0</th>
                        <th>1</th>
                        <th>e</th>
                    </thead>
                    <tbody>
                        {result}
                    </tbody>
                </table>
            );
        }else{
            result = (
                <ul className = "list-group">
                    <li className = "list-group-item list-group-item-danger">
                        {result}
                    </li>
                </ul>
            );
        }
        return(
            <Row>
                <Col xs = {12} sm = {6} smOffset = {3}>
                    <input type = "text" onChange = {this.handlerChangedInput} className = "form-control" />
                    <br />
                    {result}
                </Col>
            </Row>
        );
    }
}