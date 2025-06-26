
export default function Signature({ 
  title = "Yana Bourne",
  className = "" 
}: { 
  title?: string
  className?: string 
}) {
  return (
    <a
      href="/" 
      className={`block no-underline text-white transition duration-150 ease-in-out font-the-nautigal text-2xl ${className}`} 
    >
      {title}
    </a>
  )
}
