import '../App.css';
import { useState, useEffect } from 'react';
import { fetchAllStationNames } from '../api/stations';
import { fetchSchedule } from '../api/schedule';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select';

function SelectStation({selectedStations, onChange}) {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
    
        const loadStations = async () => {
            try {
                const stationData = await fetchAllStationNames(signal);
                setStations(stationData.map(station => ({
                    value: station.id,
                    label: station.name,
                    isDisabled: station.fgEnable === 0
                })));
            } catch (e) {
                if (e.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Fetch error:', e);
                }
            }
        };
    
        loadStations();
        return () => {
            controller.abort();
        };
    }, []);

    const customStyles = {
        control: (base, state) => ({
            ...base,
            border: 0, 
            paddingTop: '8px', 
            paddingBottom: '8px',
            paddingLeft: '10px',
            paddingRight: '10px',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(0, 0, 0, 0.1)' : 0, 
            borderRadius: '50px', 
            '&:hover': {
                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)' 
            }
        })
    };

    return (
        <>
            <Select
                    value={stations.find(station => station.value === selectedStations)}
                    onChange={onChange}
                    options={stations}
                    isDisabled={stations.length === 0}
                    placeholder="Dari Stasiun Mana?"
                noOptionsMessage={() => "Tidak ada stasiun yang tersedia"}
                styles={customStyles}

                />      
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

function SearchForm({ onSubmit }) {
    const currentHour = new Date().getHours(); 
    let initialTimeDari = `${currentHour.toString().padStart(2, '0')}:00`;
    let initialTimeSampai;

    if (currentHour === 23) {
        initialTimeSampai = '24:00';
    } else {
        initialTimeSampai = `${Math.min(currentHour + 2, 24).toString().padStart(2, '0')}:00`;
    }

    const [selectedStations, setSelectedStations] = useState("");
    const [selectedTimeDari, setSelectedTimeDari] = useState(initialTimeDari);
    const [selectedTimeSampai, setSelectedTimeSampai] = useState(initialTimeSampai);
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dataAvailable, setDataAvailable] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const handleSelectStationChange = (selectedOption) => {
        console.log(selectedOption);
        if (selectedOption) {
            setSelectedStations(selectedOption.value);
            checkValidity(selectedOption.value, selectedTimeDari, selectedTimeSampai);
        } else {
            setSelectedStations("");
            checkValidity("", selectedTimeDari, selectedTimeSampai);
        }
    };
    
    const handleSelectTimeDariChange = (event) => {
        const value = event.target.value;
        setSelectedTimeDari(value);
        checkValidity(selectedStations, value, selectedTimeSampai);
    };

    const handleSelectTimeSampaiChange = (event) => {
        const value = event.target.value;
        setSelectedTimeSampai(value);
        checkValidity(selectedStations, selectedTimeDari, value);
    };

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
    };

    const checkValidity = (stations, timeDari, timeSampai) => {
        setIsValid(stations && timeDari && timeSampai);
    };

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