import '../App.css';
import { useState, useEffect } from 'react';
import { fetchAllStationNames } from '../api/stations';
import { fetchSchedule } from '../api/schedule';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

function SelectStation({selectedStations, onChange}) {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const loadStations = async () => {
            const stationData = await fetchAllStationNames();
            setStations(stationData)
        };

        loadStations();
    }, []);

    return (
        <>
            <Form.Select className='custom-select rounded-5 p-3' value={selectedStations} onChange={onChange}>
                <option value="" className='p-2'>Dari Stasiun Mana?</option>
                    {stations.map((station, index) => (
                        <option key={index} value={station.id} disabled={station.fgEnable === 0}>  {station.fgEnable ? station.name : "----------" + station.name + "----------"}</option>
                ))}
            </Form.Select>
                
        </>
    );
}

function TimeDropDown({ selectedTime, onChange, isDari = false, selectedTimeDari = "" }) {
    let startHour = 0;
    let endHour = isDari ? 23 : 24;
    
    if (!isDari && selectedTimeDari) {
        startHour = parseInt(selectedTimeDari.split(':')[0], 10) + 1;
    }

    const hours = Array.from({ length: endHour - startHour + 1 }, (v, i) => {
        return `${(i + startHour).toString().padStart(2, '0')}:00`;
    });
    return (
        <Form.Select className='custom-select rounded-5 p-3' value={selectedTime} onChange={onChange}>
            <option value="">-</option>
            {hours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
            ))}
        </Form.Select>
    );
}

function SearchForm({onSubmit}) {
    const [selectedStations, setSelectedStations] = useState("");
    const [selectedTimeDari, setSelectedTimeDari] = useState("");
    const [selectedTimeSampai, setSelectedTimeSampai] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dataAvailable, setDataAvailable] = useState(true);
    const [showModal, setShowModal] = useState(false);

    function handleSelectStationChange(event){
        setSelectedStations(event.target.value);
    };

    function handleSelectTimeDariChange(event) {
        setSelectedTimeDari(event.target.value);
    }

    function handleSelectTimeSampaiChange(event) {
        setSelectedTimeSampai(event.target.value);
    }

    function handleSubmitButton(event) {
        event.preventDefault();
        setIsLoading(true);
        fetchSchedule(selectedStations, selectedTimeDari, selectedTimeSampai)
            .then(dataSchedule => {
                if (dataSchedule.length > 0) { 
                    onSubmit(dataSchedule);
                    setDataAvailable(true);
                } else {
                    onSubmit(dataSchedule);
                    setDataAvailable(false);
                }
        })
        .catch(error => {
            console.error("Error fetching schedule:", error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }

    useEffect(() => {
        if (selectedStations && selectedTimeDari && selectedTimeSampai) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }, [selectedStations, selectedTimeDari, selectedTimeSampai]);

    useEffect(() => {
        if (!isLoading && !dataAvailable) {
            setShowModal(true);
        }
    }, [isLoading, dataAvailable]);
    
    

    return (
        <div className='SearchContainer'>
            <form onSubmit={handleSubmitButton}>
                <div>
                    <SelectStation className="flex-grow" selectedStations={selectedStations} onChange={handleSelectStationChange} />
                </div>
                <div className='search-container-time-button'>
                    <Card className='card-time rounded-5'>
                        <Card.Title className='m-0 text-center p-2'>Dari</Card.Title>
                        <Card.Body className='pt-0'>
                            <TimeDropDown id="waktuDari" selectedTime={selectedTimeDari} onChange={handleSelectTimeDariChange} isDari={true}/>
                        </Card.Body>
                    </Card>
                    <h1><b>:</b></h1>
                    <Card className='card-time rounded-5'>
                        <Card.Title className='m-0 text-center p-2'>Sampai</Card.Title>
                        <Card.Body className='pt-0'>
                            <TimeDropDown id="waktuSampai" selectedTime={selectedTimeSampai} onChange={handleSelectTimeSampaiChange} selectedTimeDari={selectedTimeDari}/>
                        </Card.Body>
                    </Card>
                    <Button className='button-form rounded-5' disabled={!isValid || isLoading} type="submit" variant='primary'>
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="visually-hidden">Loading...</span>
                            </>
                        ) : (
                            <b>Lihat</b>
                        )}
                    </Button>
                </div>
            </form>
            <Modal show={showModal} onHide={() => setShowModal(false)}  centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tidak Ada Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>Tidak ada data tersedia untuk jadwal yang dipilih.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Tutup
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default SearchForm;