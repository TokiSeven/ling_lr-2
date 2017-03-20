export default class Atomate{
    constructor(str){
        this.setData(str);
    }

    setData(str){
        this.data = str;
        this.states = [];
        this.stars = [];
    }

    findOR(str){
        let bracketsCount = 0;
        for (let i = 0; i < str.length; i++){
            if (str[i] == '(') bracketsCount++;
            if (str[i] == ')') bracketsCount--;
            if (bracketsCount == 0 && str[i] == "|")
                return i;
        }
        return -1;
    }

    areBracketsBalanced(){
        let s = this.data;
        let count = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] == '(') count++;
            if (s[i] == ')') count--;
            if (count < 0) return false;
        }
        return (count == 0);
    }

    getAvailableName(){
        return 'St_' + this.states.length;
    }

    addState(terminal_0 = [], terminal_1 = [], terminal_e = []){
        let name = this.getAvailableName();
        this.states.push({
            'name': name,
            '0': terminal_0,
            '1': terminal_1,
            'e': terminal_e
        });
        return name;
    }

    findState(name){
        return this.states.findIndex(v => {
            return v.name == name;
        });
    }

    stateAddNext(name, terminal, next){
        let pos = this.findState(name);
        if (pos == -1) return false;
        this.states[pos][terminal.toString()].push(next);
        return true;
    }

    bindAllStars(){
        let states = this.states;
        this.stars.forEach(star => {
            // у нас есть объект с полями 'name' (имя состояние, которое является входом для звезды)
            // и 'nexts' - массивом имен, в которые надо провести Е дуги
            this.states.forEach((state, stateNum) => {
                // state - текущее выбранное состояние из всех возможных
                // если его выходы (nexts) идут в наше (star.name), то надо бы добавить еще одно следующее состояние
                // ведущее на выходы нашего
                if (state['0'].findIndex(v => {return v == star.name;}) != -1){
                    // если нашли элемент, который идет в нашу звезду
                    star.nexts.forEach(n => {
                        this.stateAddNext(state.name, 'e', n.name);
                    });
                }
                if (state['1'].findIndex(v => {return v == star.name;}) != -1){
                    // если нашли элемент, который идет в нашу звезду
                    star.nexts.forEach(n => {
                        this.stateAddNext(state.name, 'e', n.name);
                    });
                }
                if (state['e'].findIndex(v => {return v == star.name;}) != -1){
                    // если нашли элемент, который идет в нашу звезду
                    star.nexts.forEach(n => {
                        this.stateAddNext(state.name, 'e', n.name);
                    });
                }
            });
        });
        this.states = states;
    }

    getAtomata(str, s_end = [{'name': 'Z', 'terminal': 'e'}], isStar = false){
        if (!str.length) return s_end;

        // ищем 'ИЛИ'
        let pos = this.findOR(str);

        if (pos != -1){
            // 'ИЛИ' внутри строки
            // получение входных и выходных состояний левых и правых частей 'ИЛИ'
            let left = this.getAtomata(str.substr(0, pos), s_end);
            let right = this.getAtomata(str.substr(pos + 1), s_end);

            // начало может быть null, если это пустая строка ('|10', left.begins === null)
            // тогда можем сразу задать ей конец s_end (это переданное конечное состояние)
            if (left === null) left = s_end;
            if (right === null) right = s_end;

            let names = left.concat(right);

            return names;
        }else{
            // нет явного ИЛИ (только внутри скобок, но это отдельно обрабатывается)
            // обработка символа (если не скобка, иначе обработка скобки рекурсивно)

            if (str[0] == '('){
                // поиск закрывающей строки
                let count = 1;
                let positions = -1;
                for (let i = 1; i < str.length && count; i++) {
                    if (str[i] == '('){
                        count++;
                    } else if (str[i] == ')') {
                        count--;
                        if (count == 0) positions = i;
                    }
                }

                // обработка всего
                let nextsAfterBrackets = s_end;
                if (positions + 1 < str.length) // если после скобок есть что-то
                    nextsAfterBrackets = this.getAtomata(str.substr(positions + 1), s_end);
                if (nextsAfterBrackets === true || nextsAfterBrackets === false){
                    // если после скобок звезда или плюсик
                    // то берем то, что после плюсика или звезды
                    nextsAfterBrackets = this.getAtomata(str.substr(positions + 2), s_end);
                    isStar = true;
                }
                let names = this.getAtomata(str.substr(1, positions - 1), nextsAfterBrackets);
                return names;
            }else if (str[0] == '1' || str[0] == '0'){
                // если это не все, что выше, то это обычный символ
                let name = this.addState();
                let nexts = s_end;
                let isPlus = false;
                if (str.length >= 2){
                    nexts = this.getAtomata(str.substr(1), s_end);
                    if (nexts === true || nexts === false){
                        // если следующий элемент - звезда или плюс
                        // заранее узнаем что это, ибо дальше эта переменная меняется
                        if (nexts)
                            isStar = true;
                        else
                            isPlus = true;

                        // а тут берем рекурсию от следующего элемента
                        if (str.length >= 3)
                            nexts = this.getAtomata(str.substr(2), s_end);
                        else
                            nexts = s_end;

                        // а тут мы добавляем возврат на наш текущий элемент
                        // надо же вернуться
                        // nexts = nexts.concat([ {'name': name, 'terminal': str[0]} ]);
                    }
                }

                let currentTerminal = str[0];

                if (isStar || isPlus){
                    // если мы начали с этой строки и у нас флаг
                    // isStar (или isPlus) в тру, то надо в конечный элемент добавить начальный
                    // так же надо бы добавить в особый массив stars текущие вхождения и выходы
                    // чтобы потом спокойно перебиндить все состояния, которые входят в это
                    // на Е дугу к концу
                    this.stars.push({
                        'name': name,
                        'nexts': nexts
                    });
                    this.stateAddNext(name, str[0], name);
                    
                    if (isStar) currentTerminal = 'e';

                    let name2 = this.addState();
                    nexts.forEach(v => {
                        this.stateAddNext(name2, v.terminal, v.name);
                    });
                    nexts = [{
                        'name': name2,
                        'terminal': 'e'
                    }];
                    s_end.push({'name': name, 'terminal': str[0]});
                }

                nexts.forEach(v => {
                    this.stateAddNext(name, v.terminal, v.name);
                });
                
                return [{'name': name, 'terminal': currentTerminal}];
            }else if (str[0] == '*' || str[0] == '+'){
                // возвращение из getAtomata true свидетельствует о знаке * (false о знаке +), иначе объект
                return (str[0] == '*');
            }else if (str[0] != ')'){
                let er = "Неподдерживаемый символ: " + str[0];
                throw er;
            }
        }
    }

    Do(){
        if (!this.data)
            return "Пустая строка";
        let n = this.data.length;
        let error = null;
        if (!this.areBracketsBalanced())
            return "Скобки не сбалансированы!";
        
        this.states.push({
            'name': 'A',
            '0': [],
            '1': [],
            'e': []
        });
        this.states.push({
            'name': 'Z',
            '0': [],
            '1': [],
            'e': []
        });
        try{
            let inputNames = this.getAtomata(this.data);
            inputNames.forEach(v => {
                this.stateAddNext('A', v.terminal, v.name);
            });
            // console.log(this.stars);
            // this.bindAllStars();
        }catch(e){
            error = e;
        }
        return error === null ? this.states : error;
    }
}