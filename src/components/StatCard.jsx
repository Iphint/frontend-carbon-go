export default function StatCard({ label, value }) {
  return (
    <div className="stat-square">
      <div className="stat-label">{label}</div>
      <div className="stat-number">{value}</div>
    </div>
  );
}
