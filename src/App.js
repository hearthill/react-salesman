import React, { Component } from "react";
import "./App.css";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Paper from "material-ui/Paper";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
import LinearProgress from "material-ui/LinearProgress";
import DialogBox from "./components/DialogBox";

class App extends Component {
  constructor() {
    super();

    const graphSize = 14;
    let g = [];
    for (let i = 0; i < graphSize; i++) {
      let gl = [];
      for (let j = 0; j < graphSize; j++) {
        gl[j] =
          i === j ? 0 : Math.random() > 0.5 ? Math.ceil(Math.random() * 4) : -1;
      }
      g.push(gl);
    }

    let worker = new Worker("salesman.js");

    this.state = {
      graph: g,
      result: "",
      dialogVisible: false,
      editFrom: null,
      editTo: null,
      workerWorking: false,
      completed: 0,
      candidate: null,
      worker: worker
    };
  }

  closeDialog = () => {
    this.setState({
      dialogVisible: false
    });
  };

  editValue = (row, col) => {
    if (col !== row - 1 && row !== col - 1)
      this.setState({
        editFrom: row,
        editTo: col - 1,
        dialogVisible: true
      });
  };

  updateDistance = (i, j, d) => {
    let g = this.state.graph;
    g[i][j] = d;
    this.setState({
      graph: g,
      dialogVisible: false
    });
  };

  terminateWorker = () => {
    this.state.worker.terminate();
    this.setState({
      workerWorking: false,
      result: "Calculation cancelled."
    });
  };

  findRoute = () => {
    const worker = this.state.worker;
    worker.onmessage = msg => {
      if (typeof msg.data === "string" && msg.data === "working") {
        this.setState({
          result: "Calculating the shortest route..."
        });
      } else if (msg.data === null) {
        this.setState({
          result: "No path found.",
          workerWorking: false
        });
      } else if (typeof msg.data === "object" && "progress" in msg.data) {
        this.setState({
          completed: msg.data.progress
        });
      } else if (typeof msg.data === "object" && "candidate" in msg.data) {
        this.setState({
          result: "Looking for path, current candidate: " + msg.data.candidate,
          candidate: msg.data.candidate
        });
      } else if (typeof msg.data === "object" && "route" in msg.data) {
        const route = msg.data.route;
        const distance = msg.data.distance;
        if (route !== null) {
          this.setState({
            result:
              "The shortest route is " +
              distance +
              " units long (" +
              route +
              ").",
            workerWorking: false,
            candidate: route
          });
        }
      }
    };
    worker.postMessage({ command: "find", graph: this.state.graph });
    this.setState({
      workerWorking: true,
      bestSoFar: null
    });
  };

  render() {
    let progress = null;

    if (this.state.workerWorking)
      progress = (
        <div style={{ margin: 15, marginLeft: "35%", marginRight: "35%" }}>
          <LinearProgress
            color="rgb(255, 0, 100)"
            mode="determinate"
            value={this.state.completed}
          />
        </div>
      );

    const c = this.state.candidate;
    let tableCells = [];

    for (let row = 0; row < this.state.graph.length; row++) {
      let columns = [];
      columns.push(<TableRowColumn key={row}>{row}</TableRowColumn>);
      
      for (let col = 0; col < this.state.graph[row].length; col++) {
        let cellColor = {};
        if (this.state.candidate !== null) {
          const ci = c.indexOf(row);
          if (ci >= 0 && ci < c.length - 1) {
            if (c[ci + 1] === col) {
              const color =
                "rgb(" +
                255 +
                "," +
                Math.floor((ci / c.length) * 255) +
                "," +
                100 +
                ")";
              cellColor = {
                backgroundColor: color,
                color: "white"
              };
            }
          }
        }
        columns.push(
          <TableRowColumn key={col} style={cellColor}>
            {this.state.graph[row][col]}
          </TableRowColumn>
        );
      }
      tableCells.push(<TableRow key={"row_" + row}>{columns}</TableRow>);
    }

    return (
      <MuiThemeProvider>
        <div>
          <Paper
            style={{
              textAlign: "center",
              margin: "7%",
              marginTop: 10,
              padding: 10
            }}
            zDepth={3}
          >
            <Table
              fixedHeader={false}
              fixedFooter={false}
              selectable={false}
              multiSelectable={false}
              onCellClick={(row, column) => {
                this.editValue(row, column);
              }}
              onCellHover={(row, column) => {

              }}
            >
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn>Index</TableHeaderColumn>
                  {this.state.graph.map((row, index) => (
                    <TableHeaderColumn key={"row_" + index}>
                      {index}
                    </TableHeaderColumn>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody
                displayRowCheckbox={false}
                deselectOnClickaway={true}
                showRowHover={false}
              >
                {tableCells}
              </TableBody>
            </Table>

            {progress}
            <div style={{ margin: 10 }}>{this.state.result}</div>
            <FlatButton
              label="Find the shortest route"
              disabled={this.state.workerWorking}
              onClick={e => {
                this.findRoute();
              }}
              backgroundColor="rgb(255, 0, 100)" 
              hoverColor="rgb(255, 100, 100)"
              style={{
                color: "white",
                margin: 10
              }}
            />
            <RaisedButton
              label="Cancel"
              disabled={!this.state.workerWorking}
              onClick={e => {
                this.terminateWorker();
              }}
            />
          </Paper>
          <DialogBox
            visible={this.state.dialogVisible}
            onClose={this.closeDialog}
            onChange={(i, j, v) => {
              this.updateDistance(i, j, v);
            }}
            from={this.state.editFrom}
            to={this.state.editTo}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
