from setuptools import setup, find_packages
import os

version = '2.0b2'

setup(name='simplelayout.ui.base',
      version=version,
      description="",
      long_description=open("README.txt").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from http://www.python.org/pypi?%3Aaction=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Programming Language :: Python",
        "Topic :: Software Development :: Libraries :: Python Modules",
        ],
      keywords='',
      author='Victor BAUMANN (4teamwork)',
      author_email='v.baumann@4teamwork.ch',
      url='http://www.plone.org/products/simplelayout.ui.base',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['simplelayout', 'simplelayout.ui'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'jsonlib',
          # -*- Extra requirements: -*-
      ],
      entry_points="""
      # -*- Entry points: -*-
      """,
      )
