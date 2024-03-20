import React, { useEffect, useState } from 'react'
import moment from 'moment';

const Page2 = () => {
  const [Data, SetData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/snippets').then(response => {
          response.json().then(data => {
            console.log(data);
            SetData(data);
          })
        })
  },[]);

  return (
    <div>
            <h2>Code Submissions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Code Language</th>
                        <th>Standard Input (stdin)</th>
                        <th>Source Code</th>
                        <th>Timestamp</th>
                        <th>Standard Output (stdout)</th>
                    </tr>
                </thead>
                <tbody>
                    {Data.map((data, index) => (
                        <tr key={index}>
                            <td>{data.username}</td>
                            <td>{data.language}</td>
                            <td>{data.stdin}</td>
                            <td>{data.source_code_short}</td>
                            <td>{moment(data.timestamp).format('MMMM Do YYYY, h:mm a')}</td>
                            <td>{data.stdout}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
  )
}

export default Page2
