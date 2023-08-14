import './style.css';
import {make, query, Factory} from './jeffQuery.js';

const body = query('body');
const div = make('div', body);
div.textContent = "hello world";


class Task {
    description;
    isOptional;
    completionDate = null;
    constructor (description, isOptional){
        this.description = description;
        this.isOptional = isOptional;
    }

    complete(){
        this.completionDate = "TODAY'S DATE";
    }

}


class Quest {
    name; 

    dueDate;
    #completionDate;

    #tasks = [];
    #completedTasks = [];

    constructor (name, dueDate=null){
        this.name = name; 
        this.dueDate = dueDate;
    }

    removeTask(index){
        this.#tasks.splice(index, 1);
    } 

    addTask(task){
        this.#tasks.unshift(task);
    }
}

class QuestGroup {
    quests = [];
    completedQuests = []; 

    constructor(){}

    
    
}
