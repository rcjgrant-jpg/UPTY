import logo from "../assets/logo.svg";

export default function Logo({ size = 200 }) {
  return (
    <img
      src={logo}
      alt="UPTY"
      style={{ width: size, height: "auto" }}
      className="mx-auto"
    />
  );
}