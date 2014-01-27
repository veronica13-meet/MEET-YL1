class Integer(object):
	def __init__(self, number, negative):
		self.number = number
		self.negative = negative
	def display(self):
		print self.number + str(self.number)

class NegativeInteger(Integer):
	def __init__(self, number):
		super(NegativeInteger, self).__init__(number, number, negative = "-")
	def display(self):
		Integer.diplay(self)
		
if __name__ =="__main__" :
	test = Integer(4, "negative")
	test.display()
	




