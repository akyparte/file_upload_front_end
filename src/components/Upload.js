import '../App.css';
import '../Upload.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import generateUniqueId from 'generate-unique-id';
import { useSelector, useDispatch } from 'react-redux'
import { error_occured } from '../Redux_components/Actions/error';
import { useNavigate } from 'react-router-dom';

function Upload() {
    let navigate = useNavigate();
    let [operationArray, setOperationArray] = useState([]);
    let [previousPageState, setPreviousPageState] = useState(false);
    let [nextPageState, setNextPageState] = useState(false);
    let [uploadedFiles, setUploadedFiles] = useState([]);

    let [page, setPage] = useState(1);
    let [pageSize, setPageSize] = useState(10);

    let [sortBy, setSortBy] = useState('createdAt');

    let [sortOrder, setSortOrder] = useState('ASC');
    let [total, setTotal] = useState(0);
    let [currentTotal, setCurrentTotal] = useState(0);
    let [currentAction, setCurrentAction] = useState('');

    const error_status = useSelector((state) => state.error.value)
    const dispatch = useDispatch()


    const getFileLogo = (format) => {
        let src = '';
        switch (`.${format}`) {
            case '.webm':
            case '.mkv':
            case '.flv':
            case '.vob':
            case '.ogv':
            case '.ogg':
            case '.drc':
            case '.gif':
            case '.gifv':
            case '.mng':
            case '.avi':
            case '.MTS':
            case '.M2TS':
            case '.TS':
            case '.mov':
            case '.qt':
            case '.wmv':
            case '.yuv':
            case '.rm':
            case '.rmvb':
            case '.viv':
            case '.asf':
            case '.amv':
            case '.mp4':
            case '.m4p':
            case '.m4v':
            case '.mpg':
            case '.mp2':
            case '.mpe':
            case '.mpv':
            case '.svi':
            case '.3gp':
            case '.3g2':
                src = 'video.png'
                break;
            case '.mp3':
            case '.mpeg':
                src = 'audio.png'
                break;
            case '.jpg':
            case '.jpeg':
            case '.jfif':
            case '.pjpeg':
            case '.pjp':
            case '.png':
            case '.svg':
                src = ''
                break;
            case '.zip':
                src = 'zip.png'
                break;
            case '.plain':
                src = 'text.png'
                break;
            case '.pdf':
                src = 'pdf.png'
                break;
            case '.html':
                src = 'html.png'
                break;
            case '.javascript':
                src = 'javascript.png'
                break;

            default:
                break;
        }

        return src;
    }
    const selectFile = () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.multiple = true

        function formatFileSize(bytes, decimalPoint) {
            if (bytes == 0) return '0 Bytes';
            var k = 1000,
                dm = decimalPoint || 2,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return [parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i], parseFloat((bytes / Math.pow(k, i)).toFixed(dm))];
        }

        input.onchange = () => {
            let sizeLimit = Number(process.env.REACT_APP_FILE_SIZE_LIMIT);
            for (let i = 0; i < input.files.length; i++) {
                let singleFile = input.files[i];

                let result = formatFileSize(singleFile.size);
                if (result[0].includes('GB') || result[0].includes('TB')) {
                    alert(`${singleFile.name} file crossed ${sizeLimit} MB limit`);
                    return;
                }

                if (result[0].includes('MB')) {
                    if (result[1] > sizeLimit) {
                        alert(`file size limit is ${sizeLimit} MB`)
                        return;
                    }
                }
            }

            for (let i = 0; i < input.files.length; i++) {

                let singleFile = input.files[i];

                console.log(singleFile.type)
                // return;

                if (singleFile.type != 'image/png' &&
                    singleFile.type != 'video/mp4' &&
                    singleFile.type != 'audio/mp3' &&
                    singleFile.type != 'application/zip' &&
                    singleFile.type != 'application/pdf' &&
                    singleFile.type != 'text/plain' &&
                    singleFile.type != 'text/html' &&
                    singleFile.type != 'text/javascript' &&
                    singleFile.type != 'audio/mpeg'
                ) {
                    alert('invalid file format selected')
                    return;
                }
            }

            for (let i = 0; i < input.files.length; i++) {
                let file = input.files[i];

                let uniqueId = generateUniqueId();
                const controller = new AbortController();
                operationArray.push({ type: file.type, fileName: file.name, percent: 0, id: uniqueId, controller: controller })

                setOperationArray([...operationArray]);

                const formData = new FormData();
                formData.append('file', file);


                const onUploadProgress = event => {
                    const percentCompleted = Math.round((event.loaded * 100) / event.total);
                    for (let i = 0; i < operationArray.length; i++) {
                        let operation = operationArray[i];

                        if (operation.id == uniqueId) {
                            operation.percent = percentCompleted;
                            if (percentCompleted === 100) {
                                operation.finished = true;
                            }
                            setOperationArray([...operationArray])
                            break;
                        }
                    }
                };

                // const result = axios.put('/upload-file', data, {onUploadProgress});
                try {
                    axios.post(`${process.env.REACT_APP_API_URL}/files/upload-file`, formData, { onUploadProgress, signal: controller.signal }).then((result) => {
                        console.log('file upload complete')
                        let operationObj = operationArray.find((obj) => obj.id == uniqueId);
                        operationObj.initialized = true;
                        setOperationArray([...operationArray]);
                    }).catch((error) => {
                        let filteredArray = operationArray.filter((obj) => obj.id != uniqueId);
                        setOperationArray([...filteredArray]);
                        console.log(error)
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        };
        input.click();
    }

    const cancelUpload = (e) => {
        if (window.confirm('Do you want do cancel ?')) {
            let uid = e.target.getAttribute('uid');
            let operationObject = operationArray.find(obj => obj.id === uid);
            try {
                operationObject.controller.abort();
            } catch (error) {
                alert('Operation terminated')
            }
        }
    }

    const getFiles = async () => {
        try {
            let result = await axios.get(`${process.env.REACT_APP_API_URL}/files/get-files?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
            setUploadedFiles(result.data.data);
            setTotal(result.data.total)

            if (currentAction == 'previous') {
                if ((currentTotal - uploadedFiles.length) === Number(pageSize)) {
                    setPreviousPageState(false);
                    setNextPageState(true)
                }
                setCurrentTotal(currentTotal - uploadedFiles.length)
            } else if (currentAction == 'next') {
                setCurrentTotal(currentTotal + result.data.data.length);

                if ((currentTotal + result.data.data.length) === result.data.total) {
                    setNextPageState(false);
                } else {
                    setNextPageState(true);
                }
            } else if (currentAction == '') {
                if (result.data.data.length < result.data.total) {
                    setNextPageState(true)
                }
                setCurrentTotal(result.data.data.length)
            }
            setCurrentAction('')
        } catch (error) {
            dispatch(error_occured())
            console.log(error)
        }

    }

    const deleteFile = async (e) => {
        if (window.confirm('Are you sure ?')) {
            let fileId = e.target.getAttribute('igid');
            let fileObj = uploadedFiles.find(obj => obj.id == fileId);
            let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/files/delete-file`, { fileId, filename: fileObj.modifiedname });

            if (data.fileDeleted) {
                uploadedFiles = uploadedFiles.filter(obj => obj.id != fileId);
                setUploadedFiles([...uploadedFiles]);
                alert('file deleted successfully')
                getFiles();
            }
        }


    }

    const selectOnchange = (e) => {
        let value = e.target.value;
        setPage(1);
        setPageSize(value);
        setNextPageState(false);
        setPreviousPageState(false);
    }

    const nextPage = () => {
        setPage(page + 1)
        setPreviousPageState(true)
        setCurrentAction('next');
    }

    const previousPage = () => {
        setCurrentAction('previous')
        if (page > 1) {
            setPage(page - 1)
        }
    }

    // for pegination to work
    useEffect(() => {
        getFiles()
    }, [page, pageSize, sortBy, sortOrder])

    // for handling error
    useEffect(() => {
        if (error_status) {
            navigate('/error')
        }
    })
    return (
        <div className='main-frame'>
            <div className="upload-frame">
                <div className='upload-file-section'>
                    {operationArray ?
                        operationArray.map((operation, i) => {
                            return (
                                <div className='upload-box' key={i}>
                                    <div className='file-upload-data'>
                                        <h1> {operation.fileName} </h1>
                                        <div className="progress">
                                            <div className="progress-bar" role="progressbar" style={{ width: `${operation.percent}%` }} aria-valuemin="0" aria-valuemax="100">{operation.percent}%</div>
                                        </div>
                                    </div>
                                    {operation.finished && operation.initialized && <button type="button" disabled={true} className="btn btn-primary file-up-cl-btn">Done</button>}
                                    {operation.finished && !operation.initialized && <button type="button" disabled={true} className="btn btn-primary file-up-cl-btn">Initializing</button>}
                                    {!operation.finished && <button type="button" className="btn btn-primary file-up-cl-btn" uid={operation.id} onClick={cancelUpload}>Cancel</button>}
                                </div>
                            );
                        }) : <h1> No files Selected </h1>
                    }

                </div>

                <div className='upload-handle-btn-section'>
                    <button type="button" className="btn btn-primary" onClick={selectFile} >Upload File</button>
                </div>
            </div>

            <div className='uploaded-files-frame'>
                <div className='files-list'>
                    {uploadedFiles.length ? uploadedFiles.map((file, i) => {

                        let src = getFileLogo(file.filetype);
                        let downloadAPi = '';
                        if (src === '') {
                            src = file.src;
                            downloadAPi = file.src;
                        }
                        return (<div className='file-box' key={i}>
                            <div className='file-view'>
                                <img src={src} />

                                <p> <a href={downloadAPi} download={file.originalname}> {file.originalname}</a> </p>
                            </div>

                            <button igid={file.id} onClick={deleteFile} style={{ 'cursor': "pointer" }}>
                                Delete
                            </button>
                        </div>)
                    }) : (<div className='no-files'>
                        <span>No files uploaded</span>
                    </div>)
                    }
                </div>

                <div className='pagination'>
                    {previousPageState ?
                        <button className='available navigation-btn pointer' onClick={previousPage}> {'< Previous'}</button>
                        : <button className='not-available navigation-btn' disabled={true}> {'< Previous'}</button>
                    }
                    <span> page: {page}</span>
                    <span> Total Files: {total}</span>

                    <select onChange={selectOnchange} className='pointer'>
                        <option value={10}> 10 </option>
                        <option value={15}> 15 </option>
                        <option value={20}> 20 </option>
                        <option value={25}> 25 </option>

                    </select>

                    {nextPageState ?
                        <button onClick={nextPage} className='available navigation-btn pointer' > {'Next >'}</button>
                        : <button className='not-available navigation-btn' disabled={true}> {'Next >'}</button>
                    }
                </div>
            </div>
        </div>
    );
}

export default Upload;
