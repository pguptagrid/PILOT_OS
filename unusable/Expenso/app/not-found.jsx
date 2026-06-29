import { Button } from '../components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col py-20 items-center">
      <h2 className="text-6xl font-bold gradient-title mb-4">Not Found</h2>
      
      <div className="flex flex-col justify-center mx-auto border-4 border-green-500 rounded-3xl p-4">
        <p className="text-2xl font-semibold mb-4 text-center">
          Could not find requested resource. Please press the button to return home.
        </p>
      </div>

      <div className="mt-6">
        <Link href="/" passHref>
          <Button variant="outline" className="border-green-600 text-green-600">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
