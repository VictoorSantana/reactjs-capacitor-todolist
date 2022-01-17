
import React, { useState } from 'react'
import { useQuery } from 'react-query';
import { emojiService } from '../../service/emoji';

import './style.scss';

const ChooseRoute = ({ history }) => {

    const [task, setTask] = useState('');
    const [modalNewTask, setModalNewTask] = useState(false);

    const [list, setList] = useState([]);

    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const [displayRemove, setDisplayRemove] = useState(-1);

    useQuery(
        ['loadList'],
        async () => await localStorage.getItem('list'),
        {
            onSuccess: data => {
                if (data) {
                    const parsed = JSON.parse(data);
                    setList(parsed);
                }
            },
            onError: err => console.log(err.toString()),
        },
    );


    return (

        <>
            {
                modalNewTask ? (
                    <div
                        onClick={() => {
                            setModalNewTask(false);
                            setDisplayRemove(-1);
                        }}
                        className="bg-dark position-fixed section"
                        style={{ zIndex: 3, opacity: .5 }}></div>
                ) : null

            }

            {
                displayRemove >= 0 ? (
                    <div
                        onClick={() => {
                            setModalNewTask(false);
                            setDisplayRemove(-1);
                        }}
                        className="bg-dark position-fixed section"
                        style={{ zIndex: 3, opacity: .0 }}></div>
                ) : null

            }

            {
                modalNewTask ? (
                    <>
                        <div className="shadow bg-white position-fixed p-3 rounded" style={{ top: '10px', zIndex: 4, width: 'calc(100% - 20px)', margin: '0px 10px' }}>
                            <div className="form-group">
                                <label> Adicionar nova tarefa: </label>
                                <textarea className="form-control m-0" value={task} onChange={(event) => setTask(event.target.value)} rows={5}></textarea>
                            </div>
                            <div className="form-group text-center">
                                <button type="button" onClick={() => addTaskToList()} className="btn btn-primary mr-2"> Adicionar </button>
                                <button type="button" onClick={() => setModalNewTask(false)} className="btn btn-link"> Cancelar </button>
                            </div>
                        </div>
                    </>
                ) : null
            }



            <div className="section choose">
                <div className="d-flex w-100 align-items-center p-2 justify-content-between shadow">
                    <p className="m-0 text-dark h5"> Lista de tarefas </p>
                    <div className="m-0">
                        <button type="button" className="btn btn-link mr-1" onClick={() => history.push('/dashboard')}>
                            {
                                emojiService(list).emoji
                            }
                        </button>
                        <button type="button" className="btn btn-link mr-1" onClick={() => sortList()}>
                            <i className="far fa-calendar"></i>
                        </button>
                        <button type="button" className="btn btn-link" onClick={() => setModalNewTask(true)}>
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div className="choose--body pt-4">
                    {
                        list.length === 0 ? (
                            <h6 className="text-secondary h4 mt-5 text-center"> Nenhuma atividade para hoje. </h6>
                        ) : null
                    }

                    {
                        list.map((item, index) =>
                            <div
                                onTouchStart={touchStartEvent => handleTouchStart(touchStartEvent)}
                                onTouchMove={touchMoveEvent => handleTouchMove(touchMoveEvent)}
                                onTouchEnd={() => handleTouchEnd(index)}

                                key={index} className="d-flex justify-content-between align-items-center p-2 border-bottom position-relative">
                                <div style={{ width: 'calc(100% - 70px)' }}>
                                    <p className="mb-0">
                                        {item.done ? <s> {item.text} </s> : item.text}
                                    </p>
                                </div>
                                <div style={{ width: '70px' }} className="text-right">
                                    <button type="button" onClick={() => toggleDone(index)} className={item.done ? "btn btn-success" : "btn btn-secondary"}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                </div>

                                {
                                    displayRemove === index ? (
                                        <div onClick={() => removeTask(index)} className="bg-danger position-absolute d-flex align-items-center justify-content-center" style={{ width: '100%', height: '100%', zIndex: 4, left: '0px', opacity: '.8' }}>
                                            <p className="text-white m-0"> Remover ? </p>
                                        </div>
                                    ) : null
                                }

                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );


    function toggleDone(index = 0) {
        let clone = JSON.parse(JSON.stringify(list));

        if (!clone[index].done) {
            clone[index]['finishedAt'] = new Date().toISOString();
        } else {
            delete clone[index]['finishedAt'];
        }

        clone[index].done = !clone[index].done;

        setList(clone);
        // save its
        storeList(clone);
    }

    function addTaskToList() {
        let clone = JSON.parse(JSON.stringify(list));
        clone.push(
            { done: false, date: new Date().toISOString(), text: task }
        )
        setModalNewTask(false);
        setList(clone);
        setTask('');
        // save its
        storeList(clone);
    }

    function storeList(list) {
        localStorage.setItem('list', JSON.stringify(list));
    }

    function sortList() {
        let clone = JSON.parse(JSON.stringify(list));
        clone.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        setList(clone);
        storeList(clone);
    }

    function handleTouchStart(e) {
        setTouchStart(e.targetTouches[0].clientX);
    }

    function handleTouchMove(e) {
        setTouchEnd(e.targetTouches[0].clientX);
    }

    function handleTouchEnd(index = 0) {
        if (touchStart - touchEnd > 150) {
            // do your stuff here for left swipe
            // moveSliderRight();
            // console.log('moved right');
        }

        if (touchStart - touchEnd < -150) {
            // do your stuff here for right swipe
            // moveSliderLeft();
            // console.log('moved left');
            setDisplayRemove(index);
        }
    }

    function removeTask(index = 0) {
        let clone = JSON.parse(JSON.stringify(list));

        clone.splice(index, 1);
        setList(clone);
        // save its
        storeList(clone);
        setDisplayRemove(-1);
    }

}

export default ChooseRoute;