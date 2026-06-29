
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ExpenseSummary = ({monthlySpending,totalSpent}) => {
  const monthNames=[
    'Jan',
    'Feb','Mar','Apr','May','June','July','Sep','Oct','Nov','Dec'
   ];

   const chartData=monthlySpending?.map((item)=>{
    const date=new Date(item.month)
    return {
      name:monthNames[date.getMonth()],
      amount:item.total,

    };
   })|| [];

   const currentYear=new Date().getFullYear();
   const currentMonth=new Date().getMonth();

  return (
   <Card className='  mx-3 shadow-stone-950 shadow-xl'>
  <CardHeader>
    <CardTitle className='text-green-600 font-serif'>Expense Summary</CardTitle>

  </CardHeader>
  <CardContent>
    <div className='grid grid-cols-2 gap-4'>
      <div className=' rounded-lg p-4 border-2 border-green-500'>
        <p className='text-sm text-teal-800'> Total this month</p>
        <h3 className='text-2xl font-bolc mt-1'>
          ${monthlySpending?.[currentMonth]?.total.toFixed(2)||"0.00"}

        </h3>
      </div>
      <div className='rounded-lg p-4 border-2 border-green-500'>
        <p className='text-sm text-teal-800'>
          Total this year
        </p>
        <h3 className='text-2xl font-bold mt-1'>
          ${totalSpent?.toFixed(2)||"0.00"}

        </h3>
      </div>
    </div>
    <div className='h-64 mt-6'>
    <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}

        >
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value)=>[`$${value.toFixed(2)}`,'Amount']} labelFormatter={()=>'Spending'}/>


          <Bar dataKey="amount" fill="#36d7b7" activeBar={<Rectangle fill="gray" stroke="green" />} />

        </BarChart>
      </ResponsiveContainer>
      </div>
      <p className='text-xs text-muted-foreground text-center mt-2 font-semibold'>
        Monthly Spending for {currentYear}
      </p>
  </CardContent>

</Card>

  )
}

export default ExpenseSummary