import react from "react";

class Puppies extends react.Component {
  constructor(props) {
    super(props);
    this.state = {
      puppyName: "",
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.props.firebase
      .puppies()
      .push({ puppyName: this.state.puppyName })
      .catch((error) => console.log(error));

    this.setState({ puppyName: "" });
  };

  render() {
    return (
      <div>
        <h1>i love puppies</h1>
        <form onSubmit={this.handleSubmit}>
          <label>Puppy Name:</label>
          <input
            type="text"
            name="puppyName"
            value={this.state.puppyName}
            onChange={this.handleChange}
          />
          <button type="submit">Add Puppy</button>
        </form>
      </div>
    );
  }
}
export default Puppies;
