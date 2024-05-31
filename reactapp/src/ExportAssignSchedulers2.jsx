import { useState, useEffect } from 'react';
import TableSelectRows2 from './TableSelectRows2'
import useFetchInitData from './useFetchInitData';
import useSendData from './useSendData';
import getLast from './functions/getLast';


export default function ExportAssignSchedulers2({
    portfoliosAndSchedulers,
    setPortfoliosAndSchedulers,
    TimeFrame,
    setTimeFrame,
    allSchedulers,
    setAllSchedulers
}) {

    //INITIALIZE DATA
    const { data: portfolioNamesArray, isLoading: loading, error: errorInit } = useFetchInitData('/portfolios/getteststring');
    const { data: testString4, isLoading: loading4, error: errorInit4 } = useFetchInitData('scheduler/snldata');


    // STATES
    // (1) lst column hold the info: 0-not selected,1-selected,2-last selected
    // (2)assigned scheduler
    //const [portfoliosAndSchedulers, setPortfoliosAndSchedulers] = useState([]);

    useEffect(() => {
        if (portfolioNamesArray && portfolioNamesArray.length > 0) {
            setPortfoliosAndSchedulers(portfolioNamesArray.map(name => [name, "none", "none", 0]))
        }
    }, [portfolioNamesArray]);


    //TimeFrame
    //const [TimeFrame, setTimeFrame] = useState([["none", 0], ["day", 0], ["week", 0], ["month", 0]])

    //which scheduler is currently selected (menu 2)
    //const [allSchedulers, setAllSchedulers] = useState(dataSchedulers);




    //HANDLERS
    //let lastSelectedScheduler = "none"
    const handleSchedulerRowSelect = (selectedRow) => {

    };

    ///assign the selected scheduler + time-frame
    const handlePortfolioRowsSelect = (selectedRows, idx) => {
        //find the scheduler 
        let selectedScheduler = "none";
        allSchedulers.forEach(r => {
            if (getLast(r) === 2)
                selectedScheduler = r[0]
        })

        //find the timeFrame 
        let selectedTimeFrame = "none";
        TimeFrame
            .forEach(t => {
                if (t[1] === 2)
                    selectedTimeFrame = t[0]
            })

        //find the last selected row & assign the scheduler
        const updatedPortfoliosAndSchedulers = portfoliosAndSchedulers.map((row) => {
            if (getLast(row) === 2) {
                return [row[0], selectedScheduler, selectedTimeFrame, row[3]];
            }
            return row;
        });

        setPortfoliosAndSchedulers(updatedPortfoliosAndSchedulers);
    };

    let timeFrame;
    const handleSchedulerTimeSelect = (selectedRow) => {
        timeFrame = selectedRow;
        console.log("Time Frame", timeFrame)
    }


    //create an array of numbers of the selected portfolios :    [0,2]
    const numbersOfSelectedPortfolios = () => {
        const selectedPortfoliosNr = [];
        portfoliosAndSchedulers.forEach((p, idx) => {
            //select last colum of each row
            if (getLast(p)) {
                selectedPortfoliosNr.push(idx)
            }
        })
        console.log(selectedPortfoliosNr)
        return selectedPortfoliosNr
    }


    //// HOOKS sendData
    ////  sendData is a FUNCTION --> data to POST to the server    /  responseData: response data from the server
    const { sendData: sendData4, isLoading: isLoading4, error: error4, responseData: responseData4 } = useSendData();
    const { sendData: sendDataSQL2, isLoading: isLoadingSQL2, error: errorSQL2, responseData: allRows } = useSendData();

    //(for email) send the int numbers of the selected portfolios 
    const handleSendEmail = () => {


        sendData4('portfolios/PortfolioStringsArray', { portfoliosNumbersArray: numbersOfSelectedPortfolios() }); //selectedRowsNr
    };

    //write the csv's to the hard drive
    const handleSendDataCSV = () => {

        //sendDataSQL2('/portfolios/sendportfolio',
        //    { SelectedPortfolios: ["portfolio4.csv", "portfolio5.csv"], TimeFrame: 2 });
        if (numbersOfSelectedPortfolios().length > 0) {
            const selectedPortfolios = portfoliosAndSchedulers.filter(row => getLast(row) > 0).map(row => row[0]);
            const selectedPortfolios2 = portfoliosAndSchedulers.filter(row => getLast(row) > 0);
            console.log(selectedPortfolios2)
            /*selectedPortfolios.forEach((p, idx) => console.log("SIDE", portfoliosAndSchedulers[idx]))*/
            //selectedPortfolios.find()
            sendDataSQL2('/portfolios/sendportfolio',
                { SelectedPortfolios: selectedPortfolios, TimeFrame: 2 });
            //["portfolio4.csv", "portfolio5.csv"]
        } else {
            console.log('No portfolio selected');
        }
    };

    return (
        <div>
            <div>
                <TableSelectRows2
                    tableData={portfoliosAndSchedulers}
                    setTableData={setPortfoliosAndSchedulers}
                    columnHeaders={["portfolios", "schedulers"]}
                    onRowSelect={handlePortfolioRowsSelect}
                    selectionType={2}
                />
            </div>

            <div>
                <TableSelectRows2
                    tableData={allSchedulers}
                    setTableData={setAllSchedulers}
                    columnHeaders={["schedulers", "email", "date"]}
                    onRowSelect={handleSchedulerRowSelect}
                    selectionType={1}
                />
            </div>

            <div>
                <TableSelectRows2
                    tableData={TimeFrame}
                    setTableData={setTimeFrame}
                    columnHeaders={["Time Frame"]}
                    onRowSelect={handleSchedulerTimeSelect}
                    selectionType={1}
                />
            </div>

            <button onClick={handleSendEmail}>Send EMAIL</button>
            <button onClick={handleSendDataCSV}>write CSV</button>

        </div>
    )
}