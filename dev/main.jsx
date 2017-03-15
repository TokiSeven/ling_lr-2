import React from 'react';
import ReactDOM from 'react-dom';
import {Grid, Row, Col} from 'react-bootstrap';

import Task from './task/';

class Page extends React.Component{
    render(){
        return(
            <Grid>
                <Row>
                    <Col xs = {12} sm = {12} className = "text-center">
                        <h1>Автоматы с магазинной памятью</h1>
                        <h2>Рябцев Владимир Дмитриевич.</h2>
                    </Col>
                </Row>
                <Row>
                    <Col xs = {12} sm = {12} className = "text-center">
                        <h4>Необходимо написать программу, реализующую построение ДКА по цепочкам вида</h4>
                        <h3><b>Z=1+|1*01(11|01)+.</b></h3>
                        <h4>Программа должна строить НКА по введенной строке и преобразовывать его в ДКА.</h4>
                        <Task />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

ReactDOM.render(<Page />, document.getElementById('app'));