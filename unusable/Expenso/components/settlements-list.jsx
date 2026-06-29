import { api } from '../convex/_generated/api'
import React from 'react'
import { Card, CardContent } from './ui/card'
import { useConvexQuery } from '../hooks/use-convex-query'
import { ArrowLeftRight } from 'lucide-react'
import { Badge } from './ui/badge'
import { format } from 'date-fns'

const SettlementList = ({
  settlements,
  isGroupSettlement = false,
  userLookupMap,
}) => {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser)

  if (!settlements || !settlements.length) {
    return (
      <Card className='mb-6 flex flex-col mx-3 hover:shadow-2xl shadow-stone-900 shadow-2xl hover:shadow-green-400 my-2'>
        <CardContent className="py-8 text-center text-muted-foreground">
          No settlements found.
        </CardContent>
      </Card>
    )
  }

  const getUserDetails = (userId) => ({
    name:
      userId === currentUser?._id
        ? 'You'
        : userLookupMap?.[userId]?.name || 'Other User',
    imageUrl: null,
    id: userId,
  })

  return (
    <div className="flex flex-col gap-4">
      {settlements.map((settlement) => {
        const payer = getUserDetails(settlement.paidByUserId)
        const receiver = getUserDetails(settlement.receivedByUserId)
        const isCurrentUserPayer = settlement.paidByUserId === currentUser?._id
        const isCurrentUserReceiver =
          settlement.receivedByUserId === currentUser?._id

        return (
          <Card
            className="mb-6 flex flex-col mx-3 hover:shadow-2xl shadow-stone-900 shadow-2xl  my-2"
            key={settlement._id}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {isCurrentUserPayer
                        ? `You paid ${receiver.name}`
                        : isCurrentUserReceiver
                        ? `${payer.name} paid you`
                        : `${payer.name} paid ${receiver.name}`}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <span>
                        {format(new Date(settlement.date), 'MMM d yyyy')}
                      </span>
                      {settlement.note && (
                        <>
                          <span>&#x2022;</span>
                          <span>{settlement.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${settlement.amount.toFixed(2)}</div>
                  {isGroupSettlement ? (
                    <Badge variant="outline" className="mt-1">
                      Group settlements
                    </Badge>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {isCurrentUserPayer ? (
                        <span className="text-amber-600">You Paid</span>
                      ) : isCurrentUserReceiver ? (
                        <span className="text-green-600">You received</span>
                      ) : (
                        <span>Payment</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default SettlementList
