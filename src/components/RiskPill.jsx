const LABEL = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

export default function RiskPill({ risk }) {
  return (
    <span className={`risk-pill ${risk}`}>
      <span className="dot" />
      {LABEL[risk]}
    </span>
  );
}
