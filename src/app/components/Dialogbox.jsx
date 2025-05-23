import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const Dialogbox = ({
  open,
  setOpen,
  type, // "add" or "remove"
  testName,
  onAdd,
  onRemove
}) => {
  return (
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
            <Button type="button" onClick={onAdd}>
              Add
            </Button>
          )}
          {type === 'remove' && (
            <Button type="button" variant="destructive" onClick={onRemove}>
              Remove
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Dialogbox