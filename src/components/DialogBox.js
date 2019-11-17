import React, { Component } from "react";
import "../App.css";
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";
import Subheader from "material-ui/Subheader";

class DialogBox extends Component {
  actions = [
    <FlatButton
      label="Cancel"
      primary={true}
      onClick={() => {
        this.props.onClose();
      }}
      style={{
        color: "rgb(255, 0, 100)",
        margin: 15,
        marginTop: 5
      }}
    />
  ];
  render() {
    let options = [];
    for (let distance = -1; distance < 5; distance++) {
      const d = distance;
      let unit = "units"
      if (distance === 1) {
        unit = "unit"
      }
      options.push(
        <FlatButton
          key={d}
          label={
            distance < 0 ? "No connection" : distance + " " + unit
          }
          onClick={e => {
            this.props.onChange(this.props.from, this.props.to, d);
          }}
          backgroundColor="rgb(255, 0, 100)" 
          hoverColor="rgb(255, 100, 100)"
          fullWidth="true"
          style={{
            color: "white",
            marginTop: 5,
            maxWidth: 200
          }}
        />
      );
    }

    return (
      <Dialog
        actions={this.actions}
        modal={true}
        open={this.props.visible}
        onRequestClose={this.props.onClose}
        actionsContainerStyle={{textAlign: "center"}}
        contentStyle={{ width: 330, textAlign: "center" }}
      >
        <Subheader>
          Select distance from node {this.props.from} to node {this.props.to}.
        </Subheader>
        {options}
      </Dialog>
    );
  }
}

export default DialogBox;
