## Script (Python) "sl_ui_variables.js"
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=a='',b=''
##title=
##
#add global simpelayout ui variables here...

edit_mode = 0
if context.REQUEST.get('edit_mode',False):
    edit_mode = 1
if context.REQUEST.get('HTTP_REFERER', 'dummytext_than_as_five_chars')[-5:] == '/edit':
    edit_mode = 1
print """
simplelayout.force_edit_mode = %s;
""" % (edit_mode)

align_to_grid = 0
grid = getattr(context.aq_inner.aq_explicit, 'align_to_grid', False)
if int(grid):
    align_to_grid = 1

print """
simplelayout.align_to_grid = %s
""" % (align_to_grid)

return printed
