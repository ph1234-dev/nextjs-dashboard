'use server';
// Great, now let's create a Server Action that is going to be called when the form is submitted.
// dont forget to annotate 'use server'
// By adding the 'use server', you mark all the exported functions within the file as Server Actions.
//  These server functions can then be imported and used in Client and Server components. 
// Any functions included in this file that are not used will be automatically removed from the final application bundle.


import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });


const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
      .number()
      .gt(0, { message: 'Please enter an amount greater than $0.' }),
    // The amount field is specifically set to coerce (change) from a string to a number while also validating its type.
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
  });
   

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    // Storing values in cents
    // It's usually good practice to store monetary values in cents in your database 
    // to eliminate JavaScript floating-point errors and ensure greater accuracy.

    const date = new Date().toISOString().split('T')[0];
    // Creating new dates
    // Finally, let's create a new date with the format "YYYY-MM-DD" for the invoice's creation date:
    
    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      // We'll log the error to the console for now
      console.error(error);
        // If a database error occurs, return a more specific error.
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }


    revalidatePath('/dashboard/invoices');
    // Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a
    // new request to the server. You can do this with the revalidatePath function from Next.js:

    
    redirect('/dashboard/invoices');
    // At this point, you also want to redirect the user back to the /dashboard/invoices page. 
    // You can do this with the redirect function from Next.js:
}


export async function updateInvoice(id: string, formData: FormData) {
    
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
 
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      };
    }

    const { customerId, amount, status } = validatedFields.data;
   
    const amountInCents = amount * 100;
    
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    // We'll log the error to the console for now
    console.error(error);
  }
 
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');


    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  }

 

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';


export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}