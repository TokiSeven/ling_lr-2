import React from 'react';
import ReactDOM from 'react-dom';
import {Grid, Row, Col} from 'react-bootstrap';

import Task1 from './task1/';
import Task2 from './task2/';

class Exercise extends React.Component{
    render(){
        return(
            <Row>
                <Col xs = {12} sm = {12} className = "text-center">
                    <h3>Задание {this.props.num}</h3>
                    <h4>{this.props.title}</h4>
                    <h4 dangerouslySetInnerHTML={{__html: this.props.description}}></h4>
                    {this.props.children}
                </Col>
            </Row>
        );
    }
}

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
                <Exercise
                    num = "1"
                    title = "Построить примитивный МП - автомат:"
                    description = "<b>7.</b> {1^n 0^m | m&gt;n≥0}.">
                    <Task1 />
                </Exercise>
                <hr />
                <Exercise
                    num = "2"
                    title = "Построить непримитивный МП-автомат (постараться найти автомат с одним состоянием), который будет выполнять перевод:"
                    description = "<b>2.</b> 1<sup>n</sup>0<sup>m</sup>1<sup>n</sup>0<sup>m</sup> <i>в</i> 1<sup>m</sup>0<sup>m+n</sup> , n&gt;0, m&gt;0 (<i>разрешается использование нескольких стеков</i>).">
                    <Task2 />
                </Exercise>
            </Grid>
        );
    }
}

ReactDOM.render(<Page />, document.getElementById('app'));