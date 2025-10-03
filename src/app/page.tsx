export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold">Barber Project</h1>
        <p className="mt-4 text-xl text-gray-300">A solução completa para a sua barbearia.</p>
        <p className="mt-8 text-gray-400">Para acessar a página de uma barbearia, utilize o subdomínio correspondente.</p>
        <p className="mt-2 text-gray-400">Exemplo: <code className="bg-gray-700 p-1 rounded-md">nossabarbearia.localhost:3000</code></p>
      </div>
    </div>
  );
}