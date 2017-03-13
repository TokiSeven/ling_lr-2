export default class Atomate{
    constructor(str){
        this.data = str;
    }

    setData(str){
        this.data = str;
    }

    Do(){
        let n = this.data.length;
        let currState = 1;
        let memory = [];
        let error = null;
        for(let i = 0; i < n && error === null; i++){
            // идем по всей строке
            let symbol = this.data[i];
            switch(currState){
            case 1: // состояние 1 - еденицы
                if (memory.length){
                    if (symbol == '1'){
                        memory.push('Z');
                        currState = 1;
                    }else if (symbol == '0'){
                        memory.pop();
                        currState = 2;
                    }else{
                        error = "Запрещенный символ";
                    }
                }else{
                    if (symbol == '1'){
                        memory.push('Z');
                        currState = 1;
                    }else if (symbol == '0'){
                        currState = 3;
                    }else{
                        error = "Запрещенный символ";
                    }
                }
                break;
            case 2: // состояние 2 - нули (если есть еще еденицы в памяти)
                if (memory.length){
                    if (symbol == '1'){
                        error = "Запрещена 1 после 0";
                    }else if (symbol == '0'){
                        memory.pop();
                        currState = 2;
                    }else{
                        error = "Запрещенный символ";
                    }
                }else{
                    if (symbol == '1'){
                        error = "Запрещена 1 после 0";
                    }else if (symbol == '0'){
                        currState = 3;
                    }else{
                        error = "Запрещенный символ";
                    }
                }
                break;
            case 3: // состояние 3 - нули (если кончились еденицы)
                if (memory.length){
                    if (symbol == '1'){
                        error = "Неопознанная ошибка - непустой стек (память)";
                    }else if (symbol == '0'){
                        error = "Неопознанная ошибка - непустой стек (память)";
                    }else{
                        error = "Запрещенный символ";
                    }
                }else{
                    if (symbol == '1'){
                        error = "Запрещена 1 после 0";
                    }else if (symbol == '0'){
                        currState = 3;
                    }else{
                        error = "Запрещенный символ";
                    }
                }
                break;
            }
        }
        if (error === null){
            switch(currState){
            case 1:
                error = memory.length ? "Не хватает нулей" : "Нет нулей";
                break;
            case 2:
                error = memory.length ? "Колличество 0 меньше колличества 1" : "Колличество 0 равно колличеству 1";
                break;
            case 3:
                if (memory.length) error = "Неопознанная ошибка - непустой стек (память)";
                break;
            }
        }
        return error === null ? "Все хорошо" : error;
    }
}