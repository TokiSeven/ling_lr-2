import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import Atomate from './atomate.js';

export default class Task1 extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data: ""
        };
        this.Atomate1 = new Atomate("");
        this.Atomate2 = new Atomate("");
        this.Atomate3 = new Atomate("");
        this.handlerChangedInput = this.handlerChangedInput.bind(this);
    }

    handlerChangedInput(e){
        this.setState({
            data: e.target.value
        });
    }

    render(){
        this.Atomate1.setData(this.state.data);
        this.Atomate2.setData(this.state.data);
        this.Atomate3.setData(this.state.data);

        let result = this.Atomate1.Do();
        let style = Array.isArray(result) ? "success" : "danger";
        if (Array.isArray(result)){
            result = [result];
            this.Atomate2.Do();
            this.Atomate3.Do();

            this.Atomate2.goToNFA_without_E();
            this.Atomate3.goToNFA_without_E();

            this.Atomate3.goToDFA();

            result.push(this.Atomate2.getData());
            result.push(this.Atomate3.getData());
            
            let data = [];
            for(let i = 0; i < 3; i++){
                data[i] = result[i].map(v => {
                    let isEnd = v.isEnd ? "1" : "";
                    return (
                        <tr className = 'text-left'>
                            <td>{v.name}</td>
                            <td>{v['0'].join(", ")}</td>
                            <td>{v['1'].join(", ")}</td>
                            <td>{v['e'].join(", ")}</td>
                            <td>{isEnd}</td>
                        </tr>
                    );
                });
                data[i] = (
                    <table className = 'table table-hover table-condensed'>
                        <thead>
                            <th>Состояния</th>
                            <th>0</th>
                            <th>1</th>
                            <th>e</th>
                            <th></th>
                        </thead>
                        <tbody>
                            {data[i]}
                        </tbody>
                    </table>
                );
            }
            result = (
                <Row>
                    <Col xs = {12} sm = {6}>
                        <h4>НКА с Е - дугами</h4>
                        {data[0]}
                    </Col>
                    <Col xs = {12} sm = {6}>
                        <h4>НКА без Е - дуг</h4>
                        {data[1]}
                    </Col>
                    <Col xs = {12} sm = {6} smOffset = {3}>
                        <h4>ДКА</h4>
                        {data[2]}
                    </Col>
                </Row>
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
                </Col>
                <br />
                <Col xs = {12} sm = {12}>
                    {result}
                </Col>
            </Row>
        );
    }
}