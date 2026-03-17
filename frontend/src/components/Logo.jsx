import logo from "../assets/Logo.svg";

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