import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  Qubit_dna_hs: z.number().min(0, "Qubit DNA HS is required"),
  per_rex_gdan: z.number().min(0, "Per Rex Gdan is required"),
  volume: z.number().min(0, "Volume is required"),
  gDna_volume: z.number().min(0, "G-DNA Volume is required"),
  nfw: z.number().min(0, "NFW is required"),
  plate_description: z.string().min(1, "Plate Description is required"),
  well: z.string().min(1, "Well is required"),
  i5_index: z.string().min(1, "I5 Index is required"),
  i7_index: z.string().min(1, "I7 Index is required"),
  qubit_lib: z.number().min(0, "Qubit Library is required"),
})

const Dialogbox = ({
  open,
  setOpen,
  type, // "add" or "remove"
  testName,
  onAdd,
  onRemove,
  sampleIndicator
}) => {
  console.log('sampleIndicator:', sampleIndicator);
  console.log('testName:', testName);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Qubit_dna_hs: 0,
      per_rex_gdan: 0,
      volume: 0,
      gDna_volume: 0,
      nfw: 0,
      plate_description: '',
      well: '',
      i5_index: '',
      i7_index: '',
      qubit_lib: 0,
    },
  })

  const handleSubmit = (data) => {
    console.log("Form Data:", data);
    // Handle form submission logic here
    setOpen(false);
  }
  return (
    !sampleIndicator ?
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {type === 'add' ? 'Add Test Name' : 'Remove Test Name'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {type === 'add' && testName && (
              <>
                <span className='text-lg font-semibold'>
                  Selected Test Name: <span className="font-bold">{testName}</span>
                </span>
              </>
            )}
            {type === 'remove' && (
              <>
                <span className='text-lg font-normal'>
                  Are you sure you want to remove the <b> {testName}</b>?
                </span>
              </>
            )}
          </DialogDescription>
          <DialogFooter>
            {type === 'add' && (
              <>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={onAdd}>
                  Add
                </Button>
              </>
            )}
            {type === 'remove' && (
              <Button type="button" variant="destructive" onClick={onRemove}>
                Remove
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      :
      sampleIndicator && (
        <Dialog open={open} onOpenChange={setOpen} className="max-w-2xl">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Fill the Appropriate Details to move forward
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Form {...form} onSubmit={form.handleSubmit((handleSubmit))}>
                  {testName == 'Myeloid' && (
                    <>

                      <FormField
                        control={form.control}
                        name="Qubit_dna_hs"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Qubit DNA HS</label>
                            <input
                              type="number"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter Qubit DNA HS"
                            />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="per_rex_gdan"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Per Rex Gdan</label>
                            <input
                              type="number"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter Per Rex Gdan"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="volume"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Volume</label>
                            <input
                              type="number"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter Volume"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gDna_volume"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">G-DNA Volume</label>
                            <input
                              type="number"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter G-DNA Volume"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nfw"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">NFW</label>
                            <input
                              type="number"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter NFW"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="plate_description"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Plate Description</label>
                            <input
                              type="text"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter Plate Description"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="well"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Well</label>
                            <input
                              type="text"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter Well"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="i5_index"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">I5 Index</label>
                            <input
                              type="text"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter I5 Index"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="i7_index"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">I7 Index</label>
                            <input
                              type="text"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter I7 Index"
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="qubit_lib"
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Qubit Library</label>
                            <input
                              type="number"
                              {...field}
                              className="w-full p-2 border rounded"
                              placeholder="Enter Qubit Library"
                            />
                          </div>
                        )}
                      />
                    </>
                  )}
              </Form>
            </DialogDescription>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )


  )
}

export default Dialogbox