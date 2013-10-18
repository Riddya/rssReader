<?php

namespace RSS\ReaderBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Tags
 */
class Tags
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $tag;

    /**
     * @var \RSS\ReaderBundle\Entity\Rss
     */
    private $idRss;


    /**
     * @var integer
     */
    private $rssId;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set tag
     *
     * @param string $tag
     * @return Tags
     */
    public function setTag($tag)
    {
        $this->tag = $tag;
    
        return $this;
    }

    /**
     * Get tag
     *
     * @return string 
     */
    public function getTag()
    {
        return $this->tag;
    }

    /**
     * Set idRss
     *
     * @param \RSS\ReaderBundle\Entity\Rss $idRss
     * @return Tags
     */
    public function setIdRss(\RSS\ReaderBundle\Entity\Rss $idRss = null)
    {
        $this->idRss = $idRss;
    
        return $this;
    }

    /**
     * Get idRss
     *
     * @return \RSS\ReaderBundle\Entity\Rss 
     */
    public function getIdRss()
    {
        return $this->idRss;
    }

    /**
     * Get idRss
     *
     * @return \RSS\ReaderBundle\Entity\Rss
     */
    public function getRssId()
    {
        return $this->idRss->getId();
    }
}
