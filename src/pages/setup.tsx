import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Firebase Setup Required</CardTitle>
          <CardDescription>
            This application requires Firebase configuration to function.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To configure Firebase, create a <code>.env</code> file in the web directory with the following variables:
          </p>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com`}
          </pre>
          <p className="text-sm text-muted-foreground">
            You can obtain these values from the Firebase Console under Project Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
