// Simple book "cover": uses book.imageUrl if the backend sends one,
// otherwise a coloured block with the first letter of the title.
const COLORS = ['#7b1fa2', '#d84315', '#00796b', '#1565c0', '#ad1457', '#2e7d32', '#455a64', '#6d4c41'];

export default function Cover({ book, small }) {
  const className = small ? 'cover small' : 'cover';
  if (book.imageUrl) {
    return <img className={className} src={book.imageUrl} alt="" />;
  }
  return (
    <div className={className} style={{ background: COLORS[book.id % COLORS.length] }} aria-hidden="true">
      {book.title.charAt(0)}
    </div>
  );
}
