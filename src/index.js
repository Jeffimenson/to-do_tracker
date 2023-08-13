import './style.css';
import {make, query, Factory} from './jeffQuery.js';

const body = query('body');
const div = make('div', body);
div.textContent = "hello world";


const TaskProto = {
    complete(){
        this.completionDate = "TODAY'S DATE";
    }
};
function Task(description, isOptional){
    return Factory.produce(TaskProto, {
        description,
        isOptional,
        completionDate: null
    });
}

const testTask = Task("Test stuff out", true);
testTask.complete();
console.log(testTask);
//