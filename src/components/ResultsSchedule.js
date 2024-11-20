import '../App.css';
import Button from 'react-bootstrap/Button';
import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import { fetchTrainDetailSchedule } from '../api/trainSchedule';
import { Card } from 'react-bootstrap';
import { Image } from 'react-bootstrap';

function DetailModal({ trainDetail, trainDetailSchedule, show, handleClose }) {
    const marginTopClass = trainDetailSchedule.length > 0 && trainDetailSchedule[0].transit_station ? 'mt-5' : 'mt-3';
    const currentDate = new Date();

    let currentTimeFormatted = currentDate.getHours() * 60 + currentDate.getMinutes();
    let isNextScheduleFound = false;
    
    return (
        <Modal show={show} onHide={handleClose} dialogClassName='modal-detail'>
            <Modal.Header className='d-flex justify-content-center'>
                <Modal.Title className='align-items-center d-flex flex-column'>
                    <img src="https://commuterline.id/img/icon kereta.png" alt="KRL" className='img-KRL-modal'/>
                    <h3><b>{trainDetail.train_id}</b></h3>
                    <Button variant="close" className='button-close-modal' style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1050 }} onClick={handleClose}>
                    </Button>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className='d-flex flex-column align-items-center'>
                <h3>{trainDetail.dest}</h3>
                <p className='text-white m-0 rounded-5 text-center px-5' style={{ backgroundColor: trainDetail.color }}><b>{trainDetail.ka_name}</b></p>
                <div className={`${marginTopClass} w-100`}>
                {trainDetailSchedule.map((schedule, index) => {
                    const [scheduleHour, scheduleMinute] = schedule.time_est.split(':').map(Number);
                    const scheduleTime = scheduleHour * 60 + scheduleMinute; 
                    const shouldHighlight = !isNextScheduleFound && scheduleTime > currentTimeFormatted;
                    const isSameDestination = schedule.station_name === trainDetail.dest;

                    if (shouldHighlight) {
                        isNextScheduleFound = true; 
                    }

                    const backgroundColor = shouldHighlight ? "#35f261" : (isSameDestination ? "red" : "#ccc");
                    const borderColor = shouldHighlight ? "#35f261" : (isSameDestination ? "red" : "#ccc");

                    return (
                        <div key={index}>
                            <div className='d-flex schedule-container gap-0 align-items-center'>
                                <div className='station'>
                                    {schedule.transit_station &&
                                        <>
                                            <img className='img-transit' src="https://commuterline.id/img/transit.png" alt="" />
                                            <span className="line-between-station" ></span>
                                        </>
                                    }   
                                </div>
                                {schedule.transit_station ? <span className='circle-station' style={{ backgroundColor  }}></span> : <span className='circle' style={{ backgroundColor  }}></span>}
                                <span className="line-between" style={{ backgroundColor  }}></span>
                                <p className='container-station-name py-3 rounded-5 m-0 text-center'
                                    style={{
                                        border: '2px solid',
                                        borderColor,
                                        padding: '10px'
                                    }}>
                                    <b>{schedule.station_name}</b>
                                </p>
                                <span className="line-between" 
                                    style={{ backgroundColor  }}></span>
                                <p className='container-station-name py-3 rounded-5 m-0 text-center'
                                    style={{
                                        border: '2px solid',
                                        borderColor,
                                        padding: '10px'
                                    }}>
                                    <b>{schedule.time_est.split(':').slice(0, 2).join(':')}</b>
                                </p>
                            </div>
                            {schedule.transit_station && <>
                                <div className='station img-train-vector-container-parent d-flex gap-2 justify-content-start'>
                                {Array.isArray(schedule.transit) && schedule.transit.map((station, index) =>(
                                    <div key={index} className='img-train-vector-container' style={{ backgroundColor: station }}>
                                        <img className='img-train-vector align-items-center' src="https://commuterline.id/img/vector-krl.png" alt="" />
                                    </div>
                                ))}
                                </div>
                            </>}
                            <div className='station-responsive'>
                                {schedule.transit_station &&
                                    <>
                                        <img className='img-transit my-3' src="https://commuterline.id/img/transit.png" alt="" />
                                        {Array.isArray(schedule.transit) && schedule.transit.map((station, index) =>(
                                        <div key={index} className='img-train-vector-container' style={{ backgroundColor: station }}>
                                            <img className='img-train-vector align-items-center' src="https://commuterline.id/img/vector-krl.png" alt="" />
                                        </div>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>
                        );
                    })}
                </div>
            </Modal.Body>
        </Modal>
    );
}

function ResultsSchedule({ schedules }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedTrainDetail, setSelectedTrainDetail] = useState([]);
    const [selectedTrainDetailSchedule, setSelectedTrainDetailSchedule] = useState([]);
    const handleClose = () => {
        setShowModal(false)
        setSelectedTrainDetail([]);
        setSelectedTrainDetailSchedule([]);
    };
    const handleShow = (trainDetail) => { 
        fetchTrainDetailSchedule(trainDetail.train_id)
            .then(trainDetailSchedule => {
                setSelectedTrainDetailSchedule(trainDetailSchedule);
        })
        setSelectedTrainDetail(trainDetail);
        setShowModal(true);
    };

    return (
        <div className='mt-5'>
            {schedules.map((schedule, index) => (
                <div key={index} className='ResultContainer d-flex mt-3'>
                    <div className='d-flex flex-column align-items-center justify-content-start'>
                        <img src="https://commuterline.id/img/icon kereta.png" alt="KRL" className='img-KRL'/>
                        <p className='m-0'>{schedule.train_id}</p> 
                    </div>
                    <Card className='card-result rounded-5 flex-grow-1 pt-3 pb-3'>
                        <div className='card-result-detail d-flex align-items-center justify-content-between'>
                            <div className='LocationContainer text-center flex-grow-1'>
                                <p className='m-0'><b>{schedule.dest}</b></p> 
                                <p className='commuter-text text-white m-0 rounded-5 py-1' style={{ backgroundColor: schedule.color }}><b>{schedule.ka_name}</b></p>
                            </div>
                            <p className='m-0'>
                                <b>{schedule.time_est.split(':').slice(0, 2).join(':')}</b>
                            </p>
                            <Image src="https://commuterline.id/img/BUTTON LIHAT.png" alt="tombol lihat" className="clickable-image" onClick={() => handleShow(schedule)} />
                        </div>
                    </Card>
                </div>
            ))}
            <DetailModal trainDetail={selectedTrainDetail} trainDetailSchedule={selectedTrainDetailSchedule} show={showModal} handleClose={handleClose} />
        </div>
    );
}

export default ResultsSchedule;