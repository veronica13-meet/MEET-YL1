def divisors(n) :
	n = int(n)
	for num in xrange(n) :
		if n % (num+1) == 0 :
			print (num+1)
n = raw_input("give me a number buddy :)")
divisors(int(n))

